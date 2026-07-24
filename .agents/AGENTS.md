# Workspace Rules

## Communication and Formatting Guidelines
- **STRICT RULE - NO EMOJIS**: Never use emojis under any circumstances in assistant messages, user interface code, Markdown content files, headers, code comments, commit messages, or scripts.

## Server Management Guidelines
- **STRICT RULE - NEVER START DEV SERVERS**: Do not run `npm run dev`, `next dev`, or start any background development servers. The user manages their own local dev server in their active terminal.
- **STRICT RULE - DO NOT RUN `npm run build` DURING DEV**: Do not execute `npm run build` or `next build` during feature edits, as `next build` wipes and overwrites the `.next/` directory, corrupting the Webpack chunk cache of the user's active `next dev` server and causing `MODULE_NOT_FOUND` errors (`./819.js`). Use `npx tsc --noEmit` or specific scripts directly instead.
