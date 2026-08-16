# Project Rules
- Tech stack: React + Vite (frontend), Node.js + Express + MySQL (backend)
- Architecture: MVC (Controllers, Models, Routes, Services, Middlewares) - never redesign
- Follow existing coding style exactly - match naming, structure, patterns already in the codebase
- Reuse existing components (Modal, Field, PageHeader, RowActions, EmptyState, Loader, ConfirmDialog)
- Frontend theme: Tailwind v4 with custom tokens in index.css (editorial/brutalist style - hard borders, no border-radius)
- One change at a time - explain what will change before generating code
- Never modify backend unless explicitly asked
- Never change authentication, JWT, or role-based access logic without explicit approval
- Always inspect the current file before editing it

Approved. Proceed with Step 2: Sidebar Transformation + Header & Navbar Alignment.

Scope for this step ONLY:
- frontend/src/components/Sidebar.jsx
- frontend/src/components/Navbar.jsx
- frontend/src/components/PageHeader.jsx

What to improve:
- Sidebar: clearer visual separation between nav groups (Overview, People, Academic, Intelligence, Administration), a more refined active-link indicator, tighter icon/label alignment, polished bottom branding area.
- Navbar: align breadcrumb, live date, user name/role badge, and logout button on a consistent baseline; improve responsiveness.
- PageHeader: consistent title/subtitle hierarchy and button placement across pages.

Hard constraints (apply to every step below, repeating for clarity):
- Frontend files only. Do NOT touch backend.
- Do NOT change any API call, state hook, localStorage access, routing behavior, or role-based logic (allowedRoles filtering, ProtectedRoute checks, etc.) - only the JSX className/structure may change, logic must render identical.
- Do NOT change which links appear for which role - only how they look.
- Do NOT install new packages.
- Use only existing Tailwind v4 tokens/utilities and the helper classes added in Step 1.
- Preserve existing component props and exports exactly.
- Inspect each file's current content before editing it.
- If a visual improvement would require touching logic, STOP and tell me instead of changing it.

After this step, run `npm run build` to confirm no errors, then STOP and report:
1. Files modified
2. What visual changes were made
3. Confirmation that no logic/API/auth/role functionality was changed
4. Any risks or issues found

Do not proceed to Step 3 until I approve this step. aita direct copy paste korbo nki 