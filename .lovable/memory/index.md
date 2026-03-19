EDAS - AI-Based Exam Duty Allocation System. Uses Lovable Cloud (Supabase) for backend.

## Architecture
- Auth: REMOVED (all pages public, anon RLS policies)
- Roles: `user_roles` table with `app_role` enum (admin, faculty). Default signup = faculty.
- `has_role()` security definer function used in RLS policies
- Profile auto-created on signup via trigger
- All admin pages now use real DB queries (no mock data)

## Design
- Font: IBM Plex Sans/Mono
- Primary: 225 60% 45% (blue)
- Success: 155 50% 42% (green)
- Warning: 38 90% 55% (amber)
- Custom classes: stat-card, data-mono, ghost-input, conflict-row, token-badge, system-health, press-effect

## DB Tables
profiles, user_roles, exam_halls, exams, duty_assignments, nlp_requests, conflicts, notifications

## Features
- CSV upload for exam schedules (ExamsPage)
- PDF/DOC export for duty roster (RosterPage) using jsPDF + jspdf-autotable
- Smart allocation engine with subject-teacher exclusion, equal distribution, conflict prevention
