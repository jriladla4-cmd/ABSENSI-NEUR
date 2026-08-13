# figma-make-app

React + Next.js + Tailwind CSS project.

## Development Server

A Next.js development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/app/layout.tsx` - Next.js root layout; imports `src/app/globals.css` and sets document metadata
- `src/app/page.tsx` - Home route; client-mounts `src/components/App.tsx`
- `src/app/globals.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `src/components/App.tsx` - Primary application component and the usual starting point for UI work
- `src/components/pages/` - Portal screens (login, HR, employee, control center)
- `package.json` - Project dependencies and the Next.js build, development, start, and formatting scripts
- `next.config.ts` - Next.js configuration
- `postcss.config.mjs` - Tailwind CSS v4 PostCSS plugin
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: Next.js 15, React 19, and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/postcss` plugin
- Charts: Recharts
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/postcss` plugin configured in `postcss.config.mjs`. `src/app/globals.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/app/globals.css`. This scaffold does not need a Tailwind config file.

`src/app/layout.tsx` imports `src/app/globals.css`, so global font wiring belongs in `src/app/globals.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

Interactive screens live under `src/components` and must start with `'use client'` because they use React hooks and browser APIs.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
