# Design & UX Research — University Management System

> **Role:** Design/UX researcher. No code was changed while producing this document.
> **Goal:** Make the *existing* pages (Dashboard, StudentDashboard, TeacherDashboard, Students, Attendance, Results, Enrollment, Timetable, Cgpa, Payments, Exam, AdminPanel) more usable and more professional — within the current brutalist/editorial theme (hard borders, no border-radius, mono labels, tabular numerals). Not a visual redesign.
> **Sources researched:** Moodle 4.0 (Moodle.com UX blog, Moodle docs), Canvas LMS / Instructure (release notes, community KB, student/teacher mobile guides), Ellucian Banner 9 (self-service KBs, Ellucian Path design system), Blackboard Learn Ultra (gradebook rebuild + flexible grading), PeopleSoft Campus Solutions 9.2 Fluid (Student Center, Faculty Center, homepage tiles), and Bangladeshi/South Asian portals (BRAC University's buX and the USIS→Connect transformation by BRAC IT, plus community re-implementations like Bux-Reborn).
> **Method:** For each area below: what the reference systems actually do (concrete patterns, not generalities), then recommendations mapped to **this** project's pages and components.

**Hard constraint reminder applied throughout:** recommendations here are presentation/layout only where possible. Anything that needs a new API call, new state, new field, or backend change is explicitly flagged **[needs approval — logic/data, outside visual-only scope]**. Nothing below changes auth, routing, role filtering, or existing component props.

---

## MASTER PRIORITY LIST

> Merge of `AUDIT.md` → "Consolidated Fix Queue" and the "Cross-cutting summary" (§-indexed items) below. Ordered by safety (bugs first), then impact, then effort (quick wins before big rewrites). Classifications:
> - **[FRONTEND - APPROVED]** — visual/UX only, no backend touch, safe now under AGENTS.md scope.
> - **[FRONTEND - NEEDS SCOPE APPROVAL]** — frontend change but adds new behavior/logic; needs explicit go-ahead.
> - **[BACKEND - NEEDS APPROVAL]** — touches `backend/`; must not be changed without approval.

### A. Correctness bugs — fix first

1. **[FRONTEND - APPROVED]** Fix dates rendering one day early via local-date parsing in every `toDateInput` helper (Attendance, Exam, Students, Teachers, Reports). *See AUDIT.md #1 (frontend option).* (Backend alternative `dateStrings: true` = **[BACKEND - NEEDS APPROVAL]**.)
2. **[BACKEND - NEEDS APPROVAL]** Scope `GET /attendance/student/:id` to the teacher's assigned courses (privacy leak). *See AUDIT.md #4.*
3. **[BACKEND - NEEDS APPROVAL]** Validate enum values before insert so the API never reports success for silently-coerced data. *See AUDIT.md #5.*

### B. Approved visual/UX quick wins — highest impact, lowest effort

4. **[FRONTEND - APPROVED]** Hide "Add Student"/"Add Course" + `RowActions` for non-admins on `Students.jsx` + `Courses.jsx`. *See AUDIT.md #2–#3.*
5. **[FRONTEND - APPROVED]** Sidebar responsive collapse + persistent active indicator (`Sidebar.jsx`, `MainLayout.jsx`, `Navbar.jsx` — Step-2 scope). *See §3.*
6. **[FRONTEND - APPROVED]** Sortable column headers + use the dead `DAY_ORDER` constant to order `Timetable.jsx`. *See §2.*
7. **[FRONTEND - APPROVED]** Dashboards action-first: reorder `StudentDashboard.jsx`/`TeacherDashboard.jsx` ledges and stop hardcoding "Spring 2025" in `Dashboard.jsx`. *See §1.*
8. **[FRONTEND - APPROVED]** Status legend + shape channel on the `Attendance.jsx` summary line; keep all statuses dot+text. *See §5.*
9. **[FRONTEND - APPROVED]** Focus trap + return-focus in `Modal.jsx`/`ConfirmDialog.jsx` and `htmlFor`/`id` wiring in `Field.jsx`. *See §7.*

### C. Frontend features needing scope approval — new behavior/logic

10. **[FRONTEND - NEEDS SCOPE APPROVAL]** Replace `alert()` validation with inline `Field` errors + modal success state (disables nothing, but changes form-validation behavior across all modules). *See §4, §7.*
11. **[FRONTEND - NEEDS SCOPE APPROVAL]** Client-side paging for large lists (`Attendance.jsx`, `Students.jsx`, `Payments.jsx`). *See §2.*
12. **[FRONTEND - NEEDS SCOPE APPROVAL]** Name(+ID) filter on `Students.jsx` search. *See §2.*
13. **[FRONTEND - NEEDS SCOPE APPROVAL]** "Needs attention" strips on `Dashboard.jsx`/`StudentDashboard.jsx` (layout is pre-buildable; data needs a new aggregator endpoint/field). *See §1.*
14. **[FRONTEND - NEEDS SCOPE APPROVAL]** Pending-count badges on sidebar links (needs a count at nav time). *See §3.*

### D. Backend-dependent — product decision required

15. **[BACKEND - NEEDS APPROVAL]** Review timestamps next to `reviewed_by_name` in `Enrollment.jsx` (depends on a stored timestamp). *See §5.*
16. **[BACKEND - NEEDS APPROVAL]** Draft/published grade workflow — product decision; if approved, copy Blackboard's Post/Posted pill. *See §5.*

---

## 1. Dashboard design per role

### What real systems do

**Moodle 4.0** rebuilt the dashboard around a **timeline**: the first thing a learner sees is a searchable list of deadlines and "actions to complete" (activities, graded items) plus a calendar — not static stats. Teachers get the same dashboard surface plus course-management entry points, and an admin sees an extra **Site administration tab** appear at the top of primary navigation. Custom dashboards are per-audience templates; Moodle's guidance is to keep the dashboard to *essential blocks* and move everything else to role-scoped pages.

**Canvas (student)** — the 2026 customizable dashboard leads with widgets that answer two questions: *what is due* and *how am I doing*. The **Coursework widget** counts assignments due / missing / submitted and can be filtered by course or status; **Instant Grades** shows overall grades at a glance; **Recent Grades & Feedback** surfaces teacher comments without opening each course; a To-Do list and announcements complete the top. The design intent (from Instructure's student co-design sessions) is *scannable summaries for today/this week* with **click-to-expand** for detail, and grade comparisons kept opt-in because they cause stress.

**PeopleSoft (Student Center)** is the canonical "single entry point": the page leads with **Holds** and a **To-Do list** (sorted by earliest due date) because those are the items blocking the student, then class schedule, important dates, and account information. Deep functionality lives behind **homepage tiles** (Manage Classes, Academic Records, Financial Account, Tasks). The **Faculty Center** leads with the instructor's class/exam schedule, class rosters and grade rosters.

**Blackboard (teacher)** is the clearest example of action-first design: the new gradebook's **To Do panel** shows *exactly* what needs attention — ungraded submissions and unposted grades, organized by assessment — without leaving the gradebook. It was the single most-praised feature in their 2026 rebuild.

**BRAC University Connect** (Bangladesh): the old USIS forced students to physically visit instructors, deans, the Registrar and F&A for approvals with no digital traceability. Connect's redesign was explicitly "one-stop portal to complete these actions without bouncing between offices," with approvals, payments and a payment gateway in one place. Community re-implementations (Bux-Reborn) show Bangladeshi students' biggest want is a **sorted, "nearest deadline first" view of what's due today / this week / this month**.

### What this project does today

- `Dashboard.jsx` (admin): four KPI tiles (Students, Teachers, Departments, Courses) + a "Daily operations" shortcut grid. Purely read-only totals — no pending work surfaced, and the subtitle hardcodes "Spring 2025 session".
- `StudentDashboard.jsx`: four tiles (CGPA, Courses Completed, Total Credits, Classes Today), today's class list, quick-access grid. Read-only academic stats dominate; nothing surfaces *actions* (pending enrollment requests, unpaid dues, exams tomorrow).
- `TeacherDashboard.jsx`: already action-aware — "Pending Reviews" is a first-class tile with a count, alongside Assigned Courses, Enrolled Students, Today's Classes. This is the strongest dashboard and the best model for the other two.
- The project already treats "no data" vs "network error" differently in most pages (`failed` banners, `--` figures, `EmptyState` vs danger text) — this matches how Moodle/Canvas distinguish errors from empty states.

### Recommendations for this project

1. **Re-order every stat ledger so action/urgency comes before read-only numbers.** In `StudentDashboard.jsx` put "Classes Today" first (it answers "what happens now"), then CGPA/credits (read-only context). In `TeacherDashboard.jsx`, "Pending Reviews" should be the visual anchor — give it a `badge-warn` treatment when the count is > 0 so the eye lands on unfinished work, exactly like Blackboard's To Do panel. Pure reordering + class changes; no logic.
2. **Add an "In review / needs your attention" strip to `Dashboard.jsx` and `StudentDashboard.jsx`** that aggregates already-available signals (pending enrollment requests for teachers/admins; unpaid `Pending` payments and "no exam scheduled yet" gaps for students). This needs data beyond what the current endpoints return, so it is **[needs approval — new aggregator endpoint/field]**; the *layout* can be pre-built against an empty `EmptyState` today.
3. **Stop hardcoding the term.** `Dashboard.jsx`'s subtitle ("Spring 2025 session at a glance") will age into a lie. Replace with a live mono stamp (e.g., `label-mono` "as of 09 AUG 2026 · live database") — the theme already has `label-mono` and the live-data wording the page claims.
4. **Make the tiles' read-only vs actionable difference visible.** Research systems mark actionable tiles (arrow, "View"), read-only ones don't. `StudentDashboard.jsx` already does this (only CGPA and Classes Today tiles are links); apply the same link treatment consistently in `TeacherDashboard.jsx` so "Pending Reviews" and "Today's Classes" are the obvious links.

---

## 2. Data-heavy tables and lists

### What real systems do

**Blackboard's 2026 gradebook grid rebuild** is the reference for dense tabular UX. Instructors spend ~37 min/session in it, so every change reduced friction: **sortable columns** (name, ID, overall grade, any column), a **sticky column-edit pencil** that follows you while scrolling, column toggles (student ID on/off), row grouping by assessment, and a filter that was the highest-rated feature (6.57/7). **Canvas** gradebook adds explicit **status icons** (Late, Missing, Excused, Resubmitted) as a second channel beside color, and per-column search/filter. **Banner 9** uses page **sections with Filter icons**, record counts in the footer, and tabs to organize many columns. **PeopleSoft Fluid** grids support client-side filtering and configurable max rows (default 50) rather than dumping whole tables. **Enrollment pages everywhere (PeopleSoft/Banner)** group a student's classes and show a *shopping-cart / staged* model before committing.

Common thread: **sort, filter, group, count, and paginate — never force the user to scan an unsorted wall of rows.** Empty states are designed, not accidental (Canvas explicitly added an empty state for "no filter applied, nothing to show" to avoid implying data loss).

### What this project does today

- `index.css` already ships **sticky table headers** (`.data-table thead th { position: sticky }`), zebra rows, hover rows, and `tabular-nums` — genuinely good and matches the research baseline.
- `Attendance.jsx` already has: two search modes, a per-course/per-date drill-down, a `Present · Absent · Late` mono summary line with colored counts, and a % attendance figure. This is close to the reference pattern already.
- `Enrollment.jsx` already groups by course, shows **status-filter tabs with live counts**, a course quick-jump strip, and collapse/expand — an excellent dense-list pattern.
- `Results.jsx` groups by student (or course) with an **overall grade + expandable per-exam detail**, and a student-ID autocomplete picker.
- Gaps: **no client-side column sorting anywhere**; `Timetable.jsx` renders rows in server order even though the file already defines `DAY_ORDER` (so "Saturday…Friday" ordering is *available but unused*); `Attendance.jsx` will happily render a very long per-student history with no paging; `Students.jsx` search is ID-only (no name search) while other pages search names.

### Recommendations for this project

1. **Add sortable column headers** to `Attendance.jsx`, `Results.jsx`, `Payments.jsx`, `Exam.jsx`, `Timetable.jsx`, `Students.jsx` and `AdminPanel.jsx`. Click a `label-mono` header to toggle ascending/descending (name, date, marks, amount, status). This is a small, pure-presentation `useState` + sort on the already-loaded array — no API change, and it directly matches Blackboard's most-valued feature.
2. **Use the existing `DAY_ORDER` constant in `Timetable.jsx`** to sort the flat table by day (Sat→Fri) then `start_time` before render — the constant is defined in the file precisely for this and is currently dead. Also consider a "Day" group header row instead of repeating the day chip per row. Pure client-side reorder.
3. **Add paging for the genuinely large lists** — `Attendance.jsx` student history (4943 rows in the seeded DB), `Students.jsx` (93), `Payments.jsx` (273). A simple "1–50 of 4943" mono footer with Prev/Next (the `label-mono` + `btn-ghost` style already in the toolbar) beats infinite scroll for record-review work, and matches Banner/PeopleSoft's record counts. Keep the existing horizontal `table-scroll` + sticky header for wide tables.
4. **Add a name (or name+ID) filter to `Students.jsx`** to match the search behavior already in `Results.jsx`/`Payments.jsx`; the ID-only box is a paper cut for anyone who knows the student's name. Mirrors Canvas per-list search.
5. **Standardize empty-state copy as "no data yet" vs "filtered to nothing"** — the codebase mostly does this already; audit `Payments.jsx` (it only distinguishes by `payments.length === 0`, so a search that matches nothing reads like "no records exist"). `Enrollment.jsx` does this correctly and is the model.

---

## 3. Navigation and information architecture

### What real systems do

**Moodle 4.0**: role-adaptive navigation — a student sees Home / Dashboard / My Courses / Calendar; an admin gains a top-level **Site administration** tab; inside a course the **Course Index** is a collapsible left rail that scrolls independently and tracks your position. **Banner 9**: a single **four-square menu** whose options are *role-aware* (everyone sees General/Personal; students see registration; faculty see Faculty & Advisor Services); Ellucian's explicit guidance is to **flatten the hierarchy** and avoid deep submenus, and to give Student and Faculty landing pages a **custom tile grid**. **PeopleSoft Fluid**: role-specific homepages built from **tiles**, and "functional users" (a staff member who is also a student) get a homepage that dynamically surfaces both audiences — the research callout was that forcing such users to "flip between their student homepage and staff homepage" is a failure. **Canvas**: course navigation links are **hidden for roles that can't use them** (not disabled with a tooltip) — the mobile guide confirms "if a course navigation link is hidden in the browser, you cannot access it in the app."

Two recurring decisions worth copying:
- **Hide, don't disable.** Role-inappropriate actions disappear entirely rather than sitting greyed-out. (Banner, Canvas, PeopleSoft all follow this; disabling invites confusion.)
- **Collapse groups before collapsing meaning.** Grouping by domain (Overview / Academic / Admin) beats a flat mega-menu; empty groups are dropped for that role.

### What this project does today

- `Sidebar.jsx` already implements the best-practice pattern: **groups with role filtering, empty groups dropped, links hidden (not disabled) per role**, with an `active-bar` indicator and group index numbers. This is ahead of most reference systems.
- Known leak (from `AUDIT.md`): `Students.jsx` and `Courses.jsx` show **Add/Edit/Delete to teachers** who will only hit a 403 — the UI violates the "hide, don't disable" principle the rest of the app already follows (`Enrollment.jsx` correctly hides Add for teachers).

### Recommendations for this project

1. **Complete the hide-don't-disable fix** for `Students.jsx` and `Courses.jsx` (hide `actionLabel` and `RowActions` unless `role === "admin"`), mirroring how `Enrollment.jsx` and `Timetable.jsx` already gate `canManage`. This is the approved frontend-only fix already queued in `AUDIT.md` and directly matches Banner/Canvas behavior.
2. **Keep the group structure but rebalance labels for the teacher role.** Under "Academic" a teacher currently sees every admin link except a couple — fine. Under "Administration" teachers see nothing (group is dropped) — correct. One improvement: since teachers get a role-scoped Dashboard, the Overview group already shows only one Dashboard link per role (Sidebar filters by `allowedRoles`) — keep it that way; do *not* show all three dashboards.
3. **Polish the active-link indicator so it's stateful, not hover-dependent** (this is in the approved Step-2 scope for `Sidebar.jsx`): the left `active-bar` should be permanently visible on the active link and the hover ghost should only preview inactive links — Canvas and Moodle keep a persistent highlight so users can relocate themselves after scrolling. Pure class changes.
4. **Add a small per-link "pending" count where a role has queued work** (e.g., a `badge-warn` "3" on the teacher's Enrollment link mirroring the TeacherDashboard pending count). **[needs approval — requires the count at nav time or a shared fetch]**; if approved, style it like the existing `badge` component, not a generic notification dot, to stay on-theme.

---

## 4. Forms and multi-step workflows

### What real systems do

**PeopleSoft enrollment** is the canonical wizard: **add → define options (waitlist, permission numbers) → confirm → review results**, with a **confirmation page showing the transaction outcome**, real-time **schedule-conflict checking**, and a "return to class preferences" recovery link when the enrollment engine rejects something (so the user resumes the *same* flow instead of starting over). A **shopping cart** lets students validate before committing. **Blackboard Flexible Grading**: a single **grade pill** per attempt (prevents accidental overrides), an explicit **Override Final Grade** action in a menu, **unsaved-changes warnings** before navigating away, and a **submission receipt** per attempt. **Banner** saves with a visible record count; **Canvas** validates inline per field with helper text.

Patterns to copy: **validate inline at the field, confirm destructive/large actions, show the outcome of a save (receipt/state), and recover from errors without losing the user's input.**

### What this project does today

- All modules use a single `Modal` + `Field` form — appropriate; none of these workflows (add student, add exam, record result) needs a multi-step wizard, and inventing one would contradict the "one change at a time" ethos.
- **Good:** destructive flows already route through `ConfirmDialog` with honest cascade warnings ("its attendance and result records will be deleted too" — Enrollment/Students), matching the "surface consequences" principle.
- **Good:** `Attendance.jsx`'s mark-modal has a per-row **Saved / Updated** state — the receipt pattern, in miniature.
- **Weak:** every form validates with a native `alert("All fields are required")` — jarring, out-of-theme, and it discards nothing but it *feels* like a system error. Save buttons are always enabled; nothing hints at what's missing before submit.
- **Weak:** no success state survives the modal closing — the user must infer success from the refreshed table (works, but the research says make it explicit).

### Recommendations for this project

1. **Replace `alert()` validation with inline field errors.** Extend `Field.jsx` with an optional `error` prop (label turns `text-danger`, the control gets `border-danger` + a `border-l-4` accent, and `aria-invalid` / `aria-describedby` set) — reusing the theme's danger token. Each page's `handleSave` then sets a small `errors` object instead of calling `alert()`. Component-only + per-page state change; no API changes.
2. **Disable (or de-emphasize) the Save button until the form is valid**, and give the footer a hint line ("SEMESTER + SESSION required") in `label-mono`. Matches Blackboard's single-pill discipline (prevent accidental submits) and PeopleSoft's validate-before-commit.
3. **Give the Modal a short success state before closing** — on save, switch the footer button to a disabled `"Saved ✓"` in `text-ok` for ~600 ms, then close and refresh the table. Reuse the exact `Saved / Updated` pattern `Attendance.jsx` already uses per-row; it just needs to be promoted to the shared `Modal`. This is the project's own proven receipt pattern.
4. **Route destructive-enough actions through `ConfirmDialog`, not instant mutation.** Specifically: rejection in `Enrollment.jsx` (irreversible from the student's view) should get a confirm; approval can stay instant, like PeopleSoft's quick add. `AdminPanel.jsx` role changes happen on select-change with no confirmation — a wrong click reassigns a role; add a confirm there.
5. **Preserve draft input on error.** When a save fails (e.g., duplicate enrollment), the modal currently closes or the `alert` fires over the open modal — verify the `formData` is *not* reset before the request succeeds in every page (most pages only reset on success, which is correct — keep it and make it consistent).

---

## 5. Status and workflow visibility

### What real systems do

**Blackboard** is the clearest: grades are *drafted* (invisible to students) until the instructor **posts** them, and the UI shows **Post / Posted** per cell so the publish state is always legible; ungraded work is tagged **Needs Grading**. **Canvas** gradebook statuses (**Late, Missing, Excused, Resubmitted, Dropped**) render as icon + color — and after a community accessibility report, Instructure added **status icons** so meaning isn't carried by color alone. **PeopleSoft** uses explicit states everywhere (**Enrolled / Waitlisted / Dropped**, **Holds**) and surfaces them as the first thing on the Student Center; the advisor view shows registration status + instructor per class. **Moodle** shows **completion indicators** per activity in the course index. **BRAC Connect** replaced paper-approval uncertainty with digital, *traceable* approval status.

Universal rule: **a user should always be able to look at any row and know where it stands — who did what, when — without opening it.** States must be textual + glyph + color, not color alone.

### What this project does today

- `Enrollment.jsx` is already excellent: **status tabs with counts**, `badge-ok/warn/danger` badges with **dots + text**, and `reviewed_by_name` attribution under the badge. This is PeopleSoft/Blackboard-grade state visibility.
- `Attendance.jsx` status badges: **dot + color + text** (Present/Absent/Late) — already icon-inclusive, good.
- `Payments.jsx`: Paid/Pending/Failed badges — **dot + color + text**, good.
- `Results.jsx`: grade cells colored (F = `text-danger`, D/C = `text-warn`) but **with the letter always shown**, and an overall grade computed per group — good, not color-alone.
- `Exam.jsx`: exam type chips (Final is filled, others outlined) — a deliberate, readable hierarchy.
- Gaps: **no timestamps** beyond the enrollment `reviewed_by_name` (nothing records *when* a status changed); no "draft vs published" concept exists for grades (all results are immediately visible) — that's a backend domain decision, not a UI fix; `AdminPanel.jsx` shows roles as plain text with no indication of how roles were granted.

### Recommendations for this project

1. **Add a `label-mono` "reviewed 02 AUG 2026" line next to `reviewed_by_name` in `Enrollment.jsx`** — the data model stores the reviewer; if it also stores a timestamp, surface it. **[timestamp depends on backend field — needs approval if absent]**.
2. **Add a status legend to `Results.jsx` and `Attendance.jsx`** — a small mono footnote ("`F` = fail · `D`/`C` = conditional · grades above 40 are passing") pinned under the table. Canvas/Moodle both document their grade scales inline; this project's grade scale already lives in `gradeFromPercentage` and deserves a visible legend.
3. **Surface pending work from outside the module.** TeacherDashboard already counts pending reviews; carry the same count into the `Enrollment.jsx` page header (e.g., `PageHeader` subtitle: "…X requests awaiting review") so the state is visible *at the door* of the workflow, like Blackboard's To Do panel.
4. **Don't invent a publish workflow** for results (draft/published) without an explicit product decision — the current "results appear instantly" model is a backend/domain choice. If one is ever approved, the UI pattern to copy is Blackboard's **Post / Posted** pill, which would fit the existing `badge` component directly.
5. **For color-only moments, add a shape channel.** The one place the app leans on color alone is the *summary line* in `Attendance.jsx` (`<span class="font-mono text-ok">3</span> Present`). Add a tiny glyph (✓ ✗ ⏱ or letters P/A/L) beside each count — cheap, keeps the mono style, and directly answers the Canvas a11y finding that color alone is not enough.

---

## 6. Mobile / responsive behavior

### What real systems do

**Banner 9** and **PeopleSoft Fluid** are explicitly responsive; Fluid homepages can show **different tiles per form factor**, and the classic "renders based on screen size at login" issue was a known PeopleSoft problem to fix. **Canvas mobile** keeps the **dashboard, grades, to-do and notifications** for students but *omits* or de-emphasizes analytics and complex authoring (web-only), and shows course navigation collapsed into a hamburger; the Chapman comparison and the usability study both found **routine tasks (grades, announcements, quick messaging) faster on mobile, complex tasks (authoring, analytics) better on web**. **Moodle app 4.0** collapses chrome as you scroll so *content takes the full screen*, and uses bottom-bar navigation. Student co-design sessions (Canvas) preferred **scannable summaries + click-to-expand** over dense defaults.

Rule: **on small screens keep the reading tasks (grades, schedule, status) and the single most important action per page; move multi-field editing and cross-filtering behind explicit taps — never hide status.**

### What this project does today

- `MainLayout.jsx` + `Sidebar.jsx`: the sidebar is a **fixed `w-64` column on every viewport** — on a phone it consumes ~40% of the width, and `MainLayout`'s `h-screen` flex row does not stack. This is the single biggest responsive gap and matches the classic PeopleSoft "sized at login" anti-pattern.
- `Navbar.jsx` already adapts well: date hides below `lg`, username hides below `sm`, icon-only buttons remain.
- Tables use `table-scroll` (horizontal scroll) + sticky headers — workable, and how Moodle/Canvas handle wide tables on mobile; the risk is users not realizing columns exist off-screen.
- `Attendance.jsx` already hides the `hidden md:flex` time range on small screens and keeps the critical columns; stat ledges collapse 4-col → 2-col.
- Touch targets: `RowActions.jsx` buttons are `p-1.5` (~24–28 px hit area) — below the ~44 px recommendation for fingers.

### Recommendations for this project

1. **Collapse the sidebar on small screens** — either an icon rail (icons at `w-64`→`w-16`) or an off-canvas drawer toggled from the Navbar, with the active link still highlighted. This is pure layout and belongs in the approved Step-2 `Sidebar.jsx` work; it mirrors Banner 9's four-square menu and Fluid's responsive homepages. Critical: keep the group titles (or their numbers) available — don't dump 15 icon-only links without labels, which is the common icon-rail failure.
2. **Reorder table columns so the meaning survives on narrow screens.** Currently `Payments.jsx` and `Students.jsx` lead with an `ID` column (`label-mono`, mute) — on mobile that burns the first visible column on the least meaningful field. Move Student/Course/Status first (Attendance already models this). Pure `th`/`td` reorder per page.
3. **Keep status always visible; defer editing.** On mobile the approve/reject/`RowActions` buttons already exist; keep them, but consider a `sm:`-hidden "view" affordance that opens `Modal` with the row details + actions, so a phone user can *read* a row without a wide swipe. Matches Canvas/Moodle's "read on mobile, act deliberately."
4. **Add the tabular mono count to the toolbar on mobile** — the `X of Y records` lines already wrap; ensure they stay above the fold beside the search box rather than dropping below it on narrow screens (check `flex-wrap` order in `Payments.jsx`, `Exam.jsx`, `Timetable.jsx`).
5. **Enlarge RowActions hit areas on touch** (`p-2`/`min-w-[2.5rem] min-h-[2.5rem]` on small screens) — the pattern for "no critical function gated behind tiny targets" that Canvas's case studies explicitly called out.

---

## 7. Accessibility and clarity basics

### What real systems do

**Canvas/InstUI** targets WCAG 2.1 AA (AAA with the high-contrast theme), supports screen readers and never hardcodes user-facing strings; the **gradebook status-icon feature was added in direct response to a community report that three statuses relied on color alone**. **PeopleSoft** ships an accessibility accelerator that audits **tab order, screen-size redraw and keyboard paths** — the recurring PeopleSoft issues were tab order and page redraw. **Blackboard** auto-captions audio/video feedback and warns on unsaved changes. **Moodle** and **Banner** both put a **search** front-and-center (Banner's landing page searches pages/forms after 3 characters) because "findability" is an accessibility feature. Across all systems: **loading states are explicit, error messages say what broke and what to do next, and empty states explain the absence of data.**

### What this project does today

- **Strong baseline:** `index.css` defines a visible squared `:focus-visible` ring, `table, input[type=number]` use `tabular-nums`, `::selection` is inverted, and scrollbars are styled. The `Loader` has `role="status"` + `aria-live="polite"`; `Modal` uses `role="dialog"`/`aria-modal`/`aria-label`; `ConfirmDialog` uses `role="alertdialog"`; `Attendance.jsx` uses `role="alert"` on the server-failure banner; active sidebar links set `aria-current="page"`. This is genuinely above the reference-systems baseline.
- Status colors all carry text labels, and most carry dots — the codebase never relies on color alone today (the one exception is the `Attendance.jsx` summary line, flagged in §5).
- Gaps: **native `alert()` for validation/errors** (no inline, no `aria-live`), **no focus trap or return-focus** in `Modal`/`ConfirmDialog`, `Field` doesn't wire `htmlFor`/`id` (labels are `label-mono` but not always `for`-attached), and `ink-mute` (#86867e) is used for small mono meta text — borderline contrast at 0.6875rem.

### Recommendations for this project

1. **Kill `alert()` and standardize on inline + banner errors.** Add an `aria-live="polite"` inline error under the offending `Field` (see §4) and, for save failures, an in-modal danger banner reusing `bg-danger-soft`/`border-l-4 border-danger` (the pattern already exists in `StudentDashboard.jsx`'s failure banner). Native `alert()` blocks focus, reads inconsistently, and is off-theme.
2. **Add a focus trap + return focus to `Modal.jsx` and `ConfirmDialog.jsx`.** Both already trap Escape correctly; add keydown handling so Tab cycles inside the dialog and focus returns to the trigger button on close. Pure component enhancement — the highest-leverage a11y fix available without touching any page logic.
3. **Attach `htmlFor`/`id` in `Field.jsx`** (and the standalone labels in `Timetable.jsx`, `Cgpa.jsx`, `Students.jsx` already do this for their few labels). Small change; makes every modal form screen-reader clean.
4. **Add a visible "search is finding nothing" state where it's currently ambiguous** — `Payments.jsx` (§2) — and make sure the mono `X of Y records` counter updates as filters apply (it does in `Enrollment.jsx`, `Timetable.jsx`, `Students.jsx`; check `Payments.jsx`).
5. **Treat `ink-mute` as decorative-only.** It's fine for the `label-mono` captions that duplicate meaning elsewhere, but any *critical* value shown only in `ink-mute` (e.g., the `· by reviewer` line in `Enrollment.jsx`) should be bumped to `ink-soft` for contrast. Quick audit, no layout change.
6. **Document the grade scale in the UI** (see §5 recommendation 2) — "clearer error/status messaging" includes telling users what an F vs a D means *on the page*, not only in the audit doc.

---

## Cross-cutting summary (the 6 highest-value changes)

For a visual-only, no-backend pass, the order of impact:

1. **`Sidebar.jsx`/`MainLayout.jsx`:** responsive collapse + persistent active indicator (Step-2 scope already approved).
2. **Sortable columns + `DAY_ORDER` sorting** in the dense tables (§2) — pure client-side, matches Blackboard's top-rated feature.
3. **Inline `Field` errors + modal success state + focus trap** in `Modal.jsx`/`Field.jsx` (§4, §7) — the shared components buy every page at once.
4. **Hide-don't-disable for teachers on `Students.jsx`/`Courses.jsx`** (already queued in `AUDIT.md`).
5. **Re-order dashboards action-first + de-hardcode "Spring 2025"** (§1) — small, immediately visible.
6. **Status legend + shape channel in `Attendance.jsx` summary + timestamps on `Enrollment.jsx` review states** (§5).

Items that genuinely need a product/backend decision before design can proceed (flagged inline): the "needs attention" aggregator, per-role pending counts in the sidebar, review timestamps, and any future draft/published grade workflow.
