# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary Development Commands:**

- `yarn dev` - Run web frontend with HMR against production environment (https://development.gamejolt.com)
- `yarn devd` - Same as above but against development environment (for Game Jolt employees)
- `yarn client:dev` - Run desktop app development server
- `yarn client` - Launch desktop client (use with `yarn client:dev`)
- `yarn build` - Build frontend for deployment
- `yarn web:build` - Build web frontend and SSR for production

**Code Quality:**

- `yarn lint` - Lint JavaScript and Vue files with ESLint
- `yarn check` - TypeScript type checking without emitting files
- `yarn tsscript <script>` - Execute TypeScript scripts

**Testing:**
This codebase does not appear to have a standard test framework configured. No `yarn test` or similar commands are available in package.json.

**SSR Development:**

- `yarn ssr:client` then `yarn ssr:server` then `yarn ssr` - Full SSR development flow
- SSR serves on http://development.gamejolt.com:3501

## Architecture Overview

**Multi-Platform Frontend:**
This is a Vue 3.5+ TypeScript frontend that powers both the Game Jolt website and desktop application using NW.js. The codebase uses a sophisticated section-based architecture.

**Key Directories:**

- `src/` - Main source code
  - `src/_common/` - Shared components and utilities across all sections
  - `src/app/` - Main application section (most of the website/desktop app)
  - `src/auth/` - Authentication pages (login, registration)
  - `src/checkout/`, `src/claim/`, `src/editor/`, etc. - Other specialized sections
- `scripts/` - Build and development scripts
- `build/` - Build output directory

**Section Architecture:**
The codebase is split into sections that can be built and served independently:

- `app` - Main application (default)
- `auth` - Login/registration flows
- `checkout` - Payment flows
- `editor` - Game development tools
- `gameserver` - Game server functionality

Each section has its own entry point HTML file (e.g., `src/auth.html`, `src/checkout.html`).

**Technology Stack:**

- **Frontend:** Vue 3.5 with Composition API, Vue Router 4, TypeScript 5.7
- **Build:** Vite 4.4 with custom build system
- **Styling:** Stylus preprocessor
- **Desktop:** NW.js 0.62.2 for desktop app packaging
- **State:** Pinia-style stores with custom implementation
- **Development:** Custom Vite wrapper with extensive build customization

**Component Architecture:**
Components follow a pattern where shared components live in `_common/` and are organized by functionality.

**Development Environment:**

- Local development uses custom SSL certificates and hosts entry at `development.gamejolt.com`
- Hot module replacement (HMR) is available for web development
- Desktop app development requires running both the dev server and the NW.js client

**Build System:**
The build system is highly customized with a `vite-wrapper.ts` that handles:

- Multi-platform builds (web, desktop, SSR)
- Section-based building
- Environment targeting (production vs development)
- Custom asset processing and optimization

**Important Notes:**

- Don't use "any" in TypeScript. Do proper typing.
- Use all new vue 3.5+ features, include component generics, reactive props destructuring, prop shorthands, etc.
  - Use the new useTemplateRef feature of vue 3.5 instead of normal refs when it's a template ref.
    - When using useTemplateRef, you don't need to specify the element type since it will be inferred.
  - Use the new defineSlots feature of vue 3.3 when possible.
- In vue, formModels (for forms) are reactive vue objects, not a ref. Don't use .value to access.
- Don't ever rely on global components in vue. Always import what you use.
- Only one section can be served with HMR at a time
- Desktop app requires special handling for authentication flows
- Git pre-commit hooks are configured and should be installed
- TypeScript must compile without errors (`yarn run check`)
- ALWAYS run prettier after doing file modifications to ensure proper formatting. Should do this across the whole project after making changes.
- Vue components use single-file component structure with TypeScript
  - The structure should be: script, template, style (only if needed)
- For vue props we use type-based declaration as well as reactive props destructuring. Also, always use type rather than interface.
  Example:

  ```
  type Props = {
  msg?: string
  labels?: string[]
  };

  const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
  ```

- Don't specify return types in TypeScript unless absolutely needed.
- Use sentence casing for all labels and headings and buttons.
- When passing vue props to components, use the new vue shorthand when possible if the variable name matches the prop name. For example, `:required` instead of `:required="required"` when the variable is named required.
