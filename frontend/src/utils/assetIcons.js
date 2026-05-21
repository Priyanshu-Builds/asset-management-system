import { Laptop, Printer, Monitor, Smartphone, Wifi, Server, Car, Armchair, Code, Box } from 'lucide-react';

const ASSET_CATEGORY_ICONS = {
  Electronics: Laptop, Software: Code, Furniture: Armchair, Vehicles: Car,
};

export const CATEGORY_COLORS = {
  Electronics: '#3b82f6', Software: '#8b5cf6', Furniture: '#f59e0b', Vehicles: '#06b6d4',
};

export function getAssetIcon(name, category) {
  const n = (name || '').toLowerCase();
  if (n.includes('printer') || n.includes('laserjet')) return Printer;
  if (n.includes('monitor') || n.includes('display')) return Monitor;
  if (n.includes('phone') || n.includes('iphone')) return Smartphone;
  if (n.includes('router') || n.includes('wifi') || n.includes('webcam')) return Wifi;
  if (n.includes('server')) return Server;
  if (n.includes('keyboard') || n.includes('macbook') || n.includes('thinkpad') || n.includes('laptop')) return Laptop;
  return ASSET_CATEGORY_ICONS[category] || Box;
}
