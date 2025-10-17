## Repo snapshot

- Framework: React + TypeScript, built with Vite. Entry is `src/main.tsx` -> `src/App.tsx`.
- Styles: utility-first compiled CSS lives at `src/index.css` (generated Tailwind-like utilities).
- Build output: `build/` (see `vite.config.ts` outDir).

## Quick start (commands)

- Install: `npm i`
- Dev server: `npm run dev` (Vite opens at port 3000 per `vite.config.ts`)
- Production build: `npm run build` (outputs to `build/`)
- Preview a production build: `npm run build && npx vite preview --port 5000`

## Big-picture architecture & patterns

- Single-page app without a router: `src/App.tsx` manages navigation with local state `currentPage` and `onNavigate` callbacks used by `Navigation` and page components.
- Landing video gating: `App` shows `VideoLanding` until `sessionStorage.getItem('hasSeenVideo')` is set. The key is `hasSeenVideo`.
- Component layout: `src/components/` contains page components (HomePage, Services, FleetGallery, BookOnline, ContactUs, Jobs, LoginPortal) and shared UI primitives under `src/components/ui/` (Radix-based wrappers and utilities).
 - Static assets: `src/assets/`, `public/` and the `build/` output are used for images/video. The build aliases in `vite.config.ts` map several package-like strings to local modules or files; note `@` -> `src` for absolute imports. This project historically references production media from `build/` (see `src/components/VideoLanding.tsx`) — prefer `build/` for production media paths unless you're intentionally changing the asset pipeline.

## Conventions & notable details

- Navigation pages use string ids: `home`, `services`, `fleet`, `book`, `contact`, `jobs`, `login`. Add new pages by creating a component and wiring it into `App.tsx`'s `renderPage` switch and `Navigation`.
- Props pattern: page components typically accept `onNavigate?: (page: string) => void` when they can change current page.
- Styling: use existing utility classes present in `src/index.css`. Avoid adding a new CSS framework; follow the existing utility class names and tokens (for example use the provided color utilities such as `bg-black` or the gold token found in `src/index.css`).
- TypeScript: files use `.tsx`/`.ts` and the project expects strict-ish types—prefer typed props and refs.
- Do not edit `build/` (generated) except for debugging; changes will be overwritten by `npm run build`.

## Integration points & external deps

- Many Radix UI wrappers and small UI libs are used (see `package.json` dependencies). Components under `src/components/ui/` are thin helpers around these libs—edit them if you need behavior changes global to the UI.
- Vite aliasing: check `vite.config.ts` for custom alias entries (example: `'@': path.resolve(__dirname, './src')`). Search imports that might use alias strings such as `figma:asset/...`.

## Known quirks & things an agent should check before changing code

 - VideoLanding: `src/components/VideoLanding.tsx` currently references a Windows-style path in the source tag (`<source src="build\\luxury-car-intro.mp4" .../>`). This repo prefers `build/` as the location for production media, so keep that in mind when updating paths. If you move assets for local development, you can place them in `public/` and use `/luxury-car-intro.mp4` for dev; for production the app references files under `build/`. Also the loading overlay `div.absolute.inset-0` is rendered unconditionally and will sit on top of the video — confirm intended behavior before changing.
- Generated CSS: `src/index.css` is large and contains compiled utilities. Prefer changing classes in JSX rather than editing this file unless you know the generation flow.
- No tests/CI found in repo — validate changes by running `npm run dev` and visually testing flows (navigation, video flow, responsive styles).

## Small, concrete examples

- Add a new page `src/components/Testimonials.tsx` and wire it:
  - Create component that accepts `onNavigate?: (p: string) => void`
  - Add a `case 'testimonials': return <Testimonials onNavigate={handleNavigate} />;` in `App.tsx`'s `renderPage`.
  - Update `Navigation` to include a button that calls `onNavigate('testimonials')`.

 - Fixing the video path (example):
  - For production, place the final video under `build/` (the repo has historically referenced `build\\luxury-car-intro.mp4`). For local/dev convenience you may also add a copy in `public/` and use `/luxury-car-intro.mp4`.
  - Update `src/components/VideoLanding.tsx` source to a POSIX path (for production you can use `/build/luxury-car-intro.mp4` or `/luxury-car-intro.mp4` when served from `public/`) and ensure the overlay is conditionally displayed.

## Searching & editing tips

- To find where a page string is used: search for `onNavigate(` and `currentPage` or the literal page ids (e.g., `fleet`).
- When changing UI primitives, edit files under `src/components/ui/` so changes propagate to all consumers.

## When to run a full build

- Run `npm run build` before creating a production deploy or when checking the final bundled output in `build/`.

## Questions for the repo owner

- Preferred public asset paths (do you want media in `public/` or under `src/assets/`?)
- Any intended behavior for the video overlay (should it be removed once video plays?)

If anything here is unclear or you want a different tone/length, tell me what to change and I will iterate.
