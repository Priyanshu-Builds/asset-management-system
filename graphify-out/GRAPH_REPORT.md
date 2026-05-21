# Graph Report - Prototype  (2026-05-21)

## Corpus Check
- 51 files · ~43,586 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 256 nodes · 354 edges · 27 communities (22 shown, 5 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 21 edges
2. `🏢 Vaultix — Enterprise Asset Management System` - 16 edges
3. `ActivityLog` - 15 edges
4. `getAvatarByData()` - 9 edges
5. `📡 API Reference` - 9 edges
6. `getMyAvatar()` - 8 edges
7. `seed()` - 7 edges
8. `🚀 Getting Started` - 6 edges
9. `User` - 5 edges
10. `require_admin()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `seed()` --calls--> `User`  [INFERRED]
  backend/seed.py → backend/models.py
- `register()` --calls--> `User`  [INFERRED]
  backend/routes/auth.py → backend/models.py
- `update_issue()` --calls--> `ActivityLog`  [INFERRED]
  backend/routes/issues.py → backend/models.py
- `complete_maintenance()` --calls--> `ActivityLog`  [INFERRED]
  backend/routes/maintenance.py → backend/models.py
- `create_user()` --calls--> `ActivityLog`  [INFERRED]
  backend/routes/users.py → backend/models.py

## Communities (27 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (27): avatars, getAvatar(), getAvatarByData(), getMyAvatar(), getUserAvatarIndex(), setUserAvatar(), Layout(), allLinks (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (17): ActivityLog, Asset, AssetAssignment, Issue, MaintenanceRecord, seed(), create_asset(), delete_asset() (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (27): About, 🏗️ Architecture, Backend, code:block1 (┌──────────────────┐     HTTPS      ┌──────────────────┐    ), code:block2 (┌─────────────┐       ┌──────────────────┐       ┌──────────), code:block3 (asset-management-system/), Core Functionality, Dashboard & Analytics (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): dependencies, axios, lucide-react, react, react-dom, react-is, react-router-dom, recharts (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (10): COMPUTED, leftPool, rightPool, SPARKLES, ADMIN_FEATURES, AVATARS, BRAND_LOGOS, EMPLOYEE_FEATURES (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.18
Nodes (7): api, token, ISSUE_STATUSES, Issues(), ASSET_CATEGORY_ICONS, CATEGORY_COLORS, getAssetIcon()

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (7): User, register(), create_user(), get_users(), require_admin(), toggle_user_status(), update_user()

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (12): 1. Clone, 2. Backend, 3. Seed Demo Data (Optional), 4. Frontend, code:bash (git clone https://github.com/Priyanshu-Builds/asset-manageme), code:bash (cd backend), code:sql (CREATE DATABASE asset_management;), code:bash (python app.py) (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (9): Activity Logs, 📡 API Reference, Assets, Assignments, Authentication, Dashboard & Search, Issues, Maintenance (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (4): ASSET_CATEGORY_ICONS, CATEGORIES, CATEGORY_COLORS, STATUSES

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **97 isolated node(s):** `Config`, `name`, `private`, `version`, `type` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🏢 Vaultix — Enterprise Asset Management System` connect `Community 2` to `Community 9`, `Community 7`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `ActivityLog` connect `Community 1` to `Community 6`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `ActivityLog` (e.g. with `seed()` and `create_asset()`) actually correct?**
  _`ActivityLog` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Config`, `name`, `private` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09292929292929293 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08739495798319327 - nodes in this community are weakly interconnected._