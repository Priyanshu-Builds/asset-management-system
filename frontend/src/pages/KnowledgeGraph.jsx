import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getAvatarByData } from '../assets/avatars';
import {
  Network, Filter, Search, User as UserIcon, Box, AlertCircle,
  Wrench, ZoomIn, ZoomOut, RotateCcw, X, ArrowLeftRight, CheckCircle2,
  Calendar, DollarSign, Tag, Info, UserCheck, ShieldAlert
} from 'lucide-react';

const NODE_COLORS = {
  user: '#a78bfa',        // Purple
  asset: '#60a5fa',       // Blue
  issue: '#f87171',       // Red
  maintenance: '#fbbf24'  // Amber
};

const NODE_RADIUS = {
  user: 22,
  asset: 24,
  issue: 18,
  maintenance: 18
};

export default function KnowledgeGraph() {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  
  // Graph States
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    user: true,
    asset: true,
    issue: true,
    maintenance: true
  });

  // Canvas Viewport States
  const [scale, setScale] = useState(0.85);
  const [offsetX, setOffsetX] = useState(100);
  const [offsetY, setOffsetY] = useState(50);

  // Refs for physics loop
  const canvasRef = useRef(null);
  const simNodesRef = useRef([]);
  const simLinksRef = useRef([]);
  const draggedNodeRef = useRef(null);
  const isDraggingNodeRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef(null);

  // Fetch Graph Data
  useEffect(() => {
    setLoading(true);
    api.get('/graph-data')
      .then(res => {
        const { nodes, links } = res.data;
        
        // Initialize positions in a clean layout or random circle
        const initializedNodes = nodes.map((n, i) => {
          const angle = (i / nodes.length) * Math.PI * 2;
          const radius = 180 + Math.random() * 80;
          return {
            ...n,
            x: 400 + Math.cos(angle) * radius,
            y: 300 + Math.sin(angle) * radius,
            vx: 0,
            vy: 0
          };
        });

        simNodesRef.current = initializedNodes;
        simLinksRef.current = links;
        setData({ nodes: initializedNodes, links });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter nodes & links for the simulation and rendering
  const visibleNodes = data.nodes.filter(n => {
    // Type Filter
    if (!filters[n.type]) return false;
    // Search Filter
    if (searchTerm) {
      const matchLabel = n.label.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = n.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBrand = n.details?.brand?.toLowerCase()?.includes(searchTerm.toLowerCase());
      const matchRole = n.details?.role?.toLowerCase()?.includes(searchTerm.toLowerCase());
      return matchLabel || matchType || matchBrand || matchRole;
    }
    return true;
  });

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleLinks = data.links.filter(l => 
    visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target)
  );

  // Simulation parameters
  const gravity = 0.04;
  const chargeStrength = 600;
  const springStrength = 0.05;
  const restLength = 130;

  // Run Physics Tick
  const tickPhysics = () => {
    const nodes = simNodesRef.current.filter(n => visibleNodeIds.has(n.id));
    if (nodes.length === 0) return;

    // Create rapid node map
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const width = canvasRef.current?.width || 800;
    const height = canvasRef.current?.height || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Gravity / Centering
    nodes.forEach(n => {
      n.vx += (centerX - n.x) * gravity * 0.4;
      n.vy += (centerY - n.y) * gravity * 0.4;
    });

    // 2. Repulsion (Charge)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) || 0.1;

        if (dist < 400) {
          const force = chargeStrength / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // 3. Link Spring Forces
    visibleLinks.forEach(link => {
      const sourceNode = nodeMap[link.source];
      const targetNode = nodeMap[link.target];
      if (!sourceNode || !targetNode) return;

      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

      const displacement = dist - restLength;
      const force = displacement * springStrength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      sourceNode.vx += fx;
      sourceNode.vy += fy;
      targetNode.vx -= fx;
      targetNode.vy -= fy;
    });

    // 4. Update coordinates & apply damping
    nodes.forEach(n => {
      if (n === draggedNodeRef.current) {
        n.vx = 0;
        n.vy = 0;
        return;
      }

      n.x += n.vx;
      n.y += n.vy;

      // Friction
      n.vx *= 0.8;
      n.vy *= 0.8;

      // Bound them loosely
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    });
  };

  // Canvas Drawing Logic
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear and draw grid background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    const gridSize = 30;
    const startX = offsetX % (gridSize * scale);
    const startY = offsetY % (gridSize * scale);
    for (let x = startX; x < width; x += gridSize * scale) {
      for (let y = startY; y < height; y += gridSize * scale) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    // Apply viewport pan & zoom transformation
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const nodes = simNodesRef.current.filter(n => visibleNodeIds.has(n.id));
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    // DRAW EDGES (LINKS)
    visibleLinks.forEach(link => {
      const sourceNode = nodeMap[link.source];
      const targetNode = nodeMap[link.target];
      if (!sourceNode || !targetNode) return;

      const isHighlighted = 
        (selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id)) ||
        (hoveredNode && (hoveredNode.id === sourceNode.id || hoveredNode.id === targetNode.id));

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);

      // Color coding edges based on type
      let edgeColor = 'rgba(255, 255, 255, 0.08)';
      if (link.type === 'assigned') edgeColor = isHighlighted ? 'rgba(96, 165, 250, 0.7)' : 'rgba(96, 165, 250, 0.2)';
      else if (link.type === 'reported' || link.type === 'affects') edgeColor = isHighlighted ? 'rgba(248, 113, 113, 0.7)' : 'rgba(248, 113, 113, 0.2)';
      else if (link.type === 'maintained') edgeColor = isHighlighted ? 'rgba(251, 191, 36, 0.7)' : 'rgba(251, 191, 36, 0.2)';

      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
      ctx.shadowBlur = isHighlighted ? 10 : 0;
      ctx.shadowColor = edgeColor;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow
    });

    // DRAW NODES
    nodes.forEach(node => {
      const radius = NODE_RADIUS[node.type] || 20;
      const color = NODE_COLORS[node.type] || '#fff';
      
      const isSelected = selectedNode && selectedNode.id === node.id;
      const isHovered = hoveredNode && hoveredNode.id === node.id;
      const hasFocus = isSelected || isHovered;

      // Outer glow for focused/selected nodes
      if (hasFocus) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + (isHovered ? 4 : 2), 0, Math.PI * 2);
        ctx.fillStyle = `${color}15`;
        ctx.fill();
        
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
      }

      // Draw Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#161625';
      ctx.fill();
      
      ctx.strokeStyle = hasFocus ? color : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = hasFocus ? 3 : 1.5;
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw Node Icons (simplified canvas shapes)
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      if (node.type === 'user') {
        // Person Icon
        ctx.arc(node.x, node.y - 3, 5, 0, Math.PI * 2); // head
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y + 10, 8, Math.PI, 0, false); // body arc
        ctx.stroke();
      } else if (node.type === 'asset') {
        // Box Icon
        ctx.strokeRect(node.x - 7, node.y - 7, 14, 14);
        ctx.beginPath();
        ctx.moveTo(node.x - 7, node.y - 7); ctx.lineTo(node.x - 2, node.y - 2);
        ctx.moveTo(node.x + 7, node.y - 7); ctx.lineTo(node.x + 2, node.y - 2);
        ctx.moveTo(node.x - 7, node.y + 7); ctx.lineTo(node.x - 2, node.y + 2);
        ctx.moveTo(node.x + 7, node.y + 7); ctx.lineTo(node.x + 2, node.y + 2);
        ctx.stroke();
      } else if (node.type === 'issue') {
        // Exclamation/Warning Triangle
        ctx.moveTo(node.x, node.y - 8);
        ctx.lineTo(node.x + 8, node.y + 6);
        ctx.lineTo(node.x - 8, node.y + 6);
        ctx.closePath();
        ctx.stroke();
        ctx.fillRect(node.x - 1, node.y - 3, 2, 4); // exclamation bar
        ctx.fillRect(node.x - 1, node.y + 3, 2, 2); // dot
      } else if (node.type === 'maintenance') {
        // Wrench Shape
        ctx.arc(node.x - 3, node.y - 3, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.moveTo(node.x - 1, node.y - 1);
        ctx.lineTo(node.x + 7, node.y + 7);
        ctx.stroke();
      }

      // Draw Node Label underneath
      ctx.fillStyle = hasFocus ? '#ffffff' : '#9494b0';
      ctx.font = hasFocus ? 'bold 11px Inter, sans-serif' : '500 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Truncate long labels
      let displayLabel = node.label;
      if (displayLabel.length > 20) {
        displayLabel = displayLabel.substring(0, 17) + '...';
      }
      ctx.fillText(displayLabel, node.x, node.y + radius + 6);
    });

    ctx.restore();
  };

  // Simulation Frame Loop
  const animationFrame = () => {
    tickPhysics();
    drawGraph();
    requestRef.current = requestAnimationFrame(animationFrame);
  };

  useEffect(() => {
    if (!loading && data.nodes.length > 0) {
      requestRef.current = requestAnimationFrame(animationFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loading, data, filters, searchTerm, scale, offsetX, offsetY, selectedNode, hoveredNode]);

  // Coordinate Conversion (Client Mouse -> Graph Coordinates)
  const getGraphCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    return {
      x: (mouseX - offsetX) / scale,
      y: (mouseY - offsetY) / scale,
      rawX: mouseX,
      rawY: mouseY
    };
  };

  // Node Finding under Cursor
  const findNodeAtCoords = (gx, gy) => {
    const nodes = simNodesRef.current.filter(n => visibleNodeIds.has(n.id));
    return nodes.find(node => {
      const radius = NODE_RADIUS[node.type] || 20;
      return Math.hypot(node.x - gx, node.y - gy) < radius + 3;
    });
  };

  // Mouse Down Event
  const handleMouseDown = (e) => {
    const coords = getGraphCoords(e);
    const node = findNodeAtCoords(coords.x, coords.y);

    if (node) {
      draggedNodeRef.current = node;
      isDraggingNodeRef.current = true;
      setSelectedNode(node);
    } else {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Mouse Move Event
  const handleMouseMove = (e) => {
    const coords = getGraphCoords(e);
    
    // Dragging Node
    if (isDraggingNodeRef.current && draggedNodeRef.current) {
      draggedNodeRef.current.x = coords.x;
      draggedNodeRef.current.y = coords.y;
      return;
    }

    // Panning Viewport
    if (isPanningRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setOffsetX(prev => prev + dx);
      setOffsetY(prev => prev + dy);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover Details
    const node = findNodeAtCoords(coords.x, coords.y);
    if (node) {
      setHoveredNode(node);
      canvasRef.current.style.cursor = 'pointer';
    } else {
      setHoveredNode(null);
      canvasRef.current.style.cursor = isPanningRef.current ? 'grabbing' : 'grab';
    }
  };

  // Mouse Up Event
  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingNodeRef.current = false;
    isPanningRef.current = false;
  };

  // Wheel Zoom Event
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const graphMouseX = (mouseX - offsetX) / scale;
    const graphMouseY = (mouseY - offsetY) / scale;

    let newScale;
    if (e.deltaY < 0) {
      newScale = Math.min(scale * zoomFactor, 2.5);
    } else {
      newScale = Math.max(scale / zoomFactor, 0.25);
    }

    setOffsetX(mouseX - graphMouseX * newScale);
    setOffsetY(mouseY - graphMouseY * newScale);
    setScale(newScale);
  };

  // Control Buttons
  const zoomIn = () => {
    setScale(s => Math.min(s * 1.15, 2.5));
  };
  const zoomOut = () => {
    setScale(s => Math.max(s / 1.15, 0.25));
  };
  const recenter = () => {
    setScale(0.8);
    setOffsetX(150);
    setOffsetY(80);
    
    // Smooth nodes back to random center placements if needed
    const nodes = simNodesRef.current;
    const width = canvasRef.current?.width || 800;
    const height = canvasRef.current?.height || 600;
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = 100 + Math.random() * 50;
      n.x = width / 2 + Math.cos(angle) * radius;
      n.y = height / 2 + Math.sin(angle) * radius;
      n.vx = 0;
      n.vy = 0;
    });
  };

  // Select node from external link
  const selectNodeById = (nodeId) => {
    const node = simNodesRef.current.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      // Pan/Zoom towards it
      const canvas = canvasRef.current;
      if (canvas) {
        setOffsetX(canvas.width / 2 - node.x * scale);
        setOffsetY(canvas.height / 2 - node.y * scale);
      }
    }
  };

  // Sidebar Helpers
  const getConnections = (nodeId) => {
    if (!nodeId) return [];
    return data.links.filter(l => l.source === nodeId || l.target === nodeId).map(l => {
      const partnerId = l.source === nodeId ? l.target : l.source;
      const partner = data.nodes.find(n => n.id === partnerId);
      return {
        edgeType: l.type,
        edgeLabel: l.label,
        edgeDetails: l.details,
        partner
      };
    }).filter(c => c.partner && filters[c.partner.type]); // filter out hidden nodes
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 13, color: '#6b6b8a' }}>Compiling asset network...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const sidebarConnections = selectedNode ? getConnections(selectedNode.id) : [];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Network style={{ color: '#8b5cf6', width: 26, height: 26 }} />
            Enterprise Asset Knowledge Graph
          </h1>
          <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>
            Explore visual connections, active assignments, and maintenance logs across the system.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr' + (selectedNode ? ' 360px' : ''), gap: 20, flex: 1, minHeight: 0 }}>
        
        {/* LEFT SIDEBAR: FILTERS AND SEARCH */}
        <div className="glass-strong" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
          
          {/* Search bar */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search style={{ width: 14, height: 14, color: '#8b5cf6' }} /> Search Network
            </h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input"
                placeholder="Find asset, employee, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 34 }}
              />
              <Search style={{ position: 'absolute', left: 12, top: 12, width: 14, height: 14, color: '#6b6b8a' }} />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'none', cursor: 'pointer', color: '#6b6b8a' }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
          </div>

          {/* Node Category Filters */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter style={{ width: 14, height: 14, color: '#8b5cf6' }} /> Filter Elements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 13, color: '#c0c0d4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: NODE_COLORS.asset }} />
                  <span>Assets</span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.asset}
                  onChange={(e) => setFilters(prev => ({ ...prev, asset: e.target.checked }))}
                  style={{ marginLeft: 'auto', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 13, color: '#c0c0d4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: NODE_COLORS.user }} />
                  <span>Users / Employees</span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.user}
                  onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.checked }))}
                  style={{ marginLeft: 'auto', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 13, color: '#c0c0d4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: NODE_COLORS.issue }} />
                  <span>Issues Reported</span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.issue}
                  onChange={(e) => setFilters(prev => ({ ...prev, issue: e.target.checked }))}
                  style={{ marginLeft: 'auto', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 13, color: '#c0c0d4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: NODE_COLORS.maintenance }} />
                  <span>Maintenance Records</span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.maintenance}
                  onChange={(e) => setFilters(prev => ({ ...prev, maintenance: e.target.checked }))}
                  style={{ marginLeft: 'auto', cursor: 'pointer' }}
                />
              </label>

            </div>
          </div>

          {/* Quick Guide / Help */}
          <div style={{ marginTop: 'auto', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: 12, padding: 14 }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#c0c0d4', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info style={{ width: 14, height: 14, color: '#60a5fa' }} /> Instructions
            </h4>
            <ul style={{ fontSize: 11, color: '#6b6b8a', paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Click + Drag</strong> a node to rearrange.</li>
              <li><strong>Scroll Wheel</strong> to Zoom in/out.</li>
              <li><strong>Click Background</strong> & drag to Pan.</li>
              <li><strong>Click Node</strong> to reveal connections in sidebar.</li>
            </ul>
          </div>
        </div>

        {/* CENTER COLUMN: CANVAS WORKSPACE */}
        <div style={{ position: 'relative', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          
          <canvas
            ref={canvasRef}
            width={760}
            height={560}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ width: '100%', height: '100%', display: 'block', background: '#0a0a12' }}
          />

          {/* Control overlay */}
          <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={zoomIn} style={{ padding: 8, minWidth: 36, height: 36 }} title="Zoom In">
              <ZoomIn style={{ width: 16, height: 16 }} />
            </button>
            <button className="btn-ghost" onClick={zoomOut} style={{ padding: 8, minWidth: 36, height: 36 }} title="Zoom Out">
              <ZoomOut style={{ width: 16, height: 16 }} />
            </button>
            <button className="btn-ghost" onClick={recenter} style={{ padding: 8, minWidth: 36, height: 36 }} title="Recenter Graph">
              <RotateCcw style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Floating Hover Indicator */}
          {hoveredNode && (
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(15, 15, 26, 0.9)',
              border: `1px solid ${NODE_COLORS[hoveredNode.type]}`,
              borderRadius: 8,
              padding: '6px 12px',
              pointerEvents: 'none',
              backdropFilter: blur('10px'),
              fontSize: 12
            }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>{hoveredNode.label}</span>
              <span style={{ fontSize: 10, color: NODE_COLORS[hoveredNode.type], marginLeft: 8, textTransform: 'uppercase', fontWeight: 'bold' }}>
                {hoveredNode.type}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: NODE DETAILED RELATIONSHIPS */}
        {selectedNode && (
          <div className="glass-strong" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 5,
                  background: `${NODE_COLORS[selectedNode.type]}15`,
                  color: NODE_COLORS[selectedNode.type],
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {selectedNode.type}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNode(null)} 
                style={{ background: 'none', border: 'none', color: '#6b6b8a', cursor: 'pointer', padding: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Profile/Item Title Block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {selectedNode.type === 'user' ? (
                <img
                  src={getAvatarByData(selectedNode.details.avatar, selectedNode.label)}
                  alt={selectedNode.label}
                  className="avatar-lg"
                  style={{ width: 48, height: 48, border: `2px solid ${NODE_COLORS.user}` }}
                />
              ) : (
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${NODE_COLORS[selectedNode.type]}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedNode.type === 'asset' && <Box style={{ width: 22, height: 22, color: NODE_COLORS.asset }} />}
                  {selectedNode.type === 'issue' && <AlertCircle style={{ width: 22, height: 22, color: NODE_COLORS.issue }} />}
                  {selectedNode.type === 'maintenance' && <Wrench style={{ width: 22, height: 22, color: NODE_COLORS.maintenance }} />}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedNode.label}
                </h2>
                <p style={{ fontSize: 12, color: '#6b6b8a', marginTop: 2 }}>ID: #{selectedNode.id}</p>
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />

            {/* Properties Block */}
            <div>
              <h3 style={{ fontSize: 11, fontWeight: 600, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Properties
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedNode.type === 'user' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}><UserCheck style={{ width: 14, height: 14 }} /> Role</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{selectedNode.details.role}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}><ShieldAlert style={{ width: 14, height: 14 }} /> Department</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{selectedNode.details.department || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}>Email</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedNode.details.email}>
                        {selectedNode.details.email}
                      </span>
                    </div>
                  </>
                )}

                {selectedNode.type === 'asset' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}><Tag style={{ width: 14, height: 14 }} /> Category</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{selectedNode.details.category}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}>Brand / Model</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{selectedNode.details.brand} {selectedNode.details.model}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}>Serial Number</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{selectedNode.details.serial_number}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}>Status</span>
                      <span className={`badge badge-${selectedNode.details.status}`}>{selectedNode.details.status.replace('_', ' ')}</span>
                    </div>
                  </>
                )}

                {selectedNode.type === 'issue' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}>Issue Status</span>
                      <span className={`badge badge-${selectedNode.details.status}`}>{selectedNode.details.status.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar style={{ width: 14, height: 14 }} /> Reported On</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>
                        {selectedNode.details.created_at ? new Date(selectedNode.details.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>
                      <span style={{ color: '#6b6b8a', display: 'block', marginBottom: 6 }}>Description</span>
                      <p style={{ color: '#e4e4f0', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {selectedNode.details.description}
                      </p>
                    </div>
                  </>
                )}

                {selectedNode.type === 'maintenance' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}><UserCheck style={{ width: 14, height: 14 }} /> Technician</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{selectedNode.details.technician}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar style={{ width: 14, height: 14 }} /> Date</span>
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>
                        {selectedNode.details.date ? new Date(selectedNode.details.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign style={{ width: 14, height: 14 }} /> Cost</span>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>₹{selectedNode.details.cost?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>
                      <span style={{ color: '#6b6b8a', display: 'block', marginBottom: 6 }}>Description</span>
                      <p style={{ color: '#e4e4f0', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {selectedNode.details.description || 'No description provided.'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />

            {/* Connections Block */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Network Connections ({sidebarConnections.length})
              </h3>
              
              {sidebarConnections.length === 0 ? (
                <div style={{ color: '#6b6b8a', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                  No active connections in filtered view.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
                  {sidebarConnections.map((conn, idx) => {
                    const color = NODE_COLORS[conn.partner.type] || '#fff';
                    return (
                      <div 
                        key={idx}
                        onClick={() => selectNodeById(conn.partner.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = color;
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        }}
                      >
                        {/* Connected Node Small Icon */}
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: `${color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {conn.partner.type === 'user' && <UserIcon style={{ width: 13, height: 13, color }} />}
                          {conn.partner.type === 'asset' && <Box style={{ width: 13, height: 13, color }} />}
                          {conn.partner.type === 'issue' && <AlertCircle style={{ width: 13, height: 13, color }} />}
                          {conn.partner.type === 'maintenance' && <Wrench style={{ width: 13, height: 13, color }} />}
                        </div>

                        {/* Connected Node Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: '#e4e4f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conn.partner.label}
                          </div>
                          <div style={{ fontSize: 10, color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                            <ArrowLeftRight style={{ width: 10, height: 10 }} />
                            <span>{conn.edgeLabel.replace('_', ' ')}</span>
                            {conn.edgeDetails?.status && (
                              <span style={{ fontSize: 9, opacity: 0.8 }}>({conn.edgeDetails.status})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
