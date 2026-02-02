# Server-only boundary

**Server-only; do not import from client components or client-safe code.**

This folder is for helpers used by `pages/api` (e.g. WordPress client, auth). Nothing here may be imported by client components or by code that runs in the browser. No file moves are required today; future refactors can move server logic here when they naturally extract it.
