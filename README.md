# Jatin Kashyap — A Small World

An explorable, handcrafted low-poly portfolio: the island is the navigation, not a decorative background. A build-free static website using modular JavaScript and Three.js 0.170.0. React and a bundler are intentionally unnecessary for this small, imperative 3D experience.

## Screenshot

![Portfolio Preview](assets/screenshot.png)


## Implemented features

- Procedural faceted floating island with eight meaningful destinations:
  - **Observatory / About:** stepped circular architecture, glazed drum, dome, rotating antenna and restrained beacon; exact supplied profile content.
  - **District / Projects:** four individually selectable buildings for MAYA AI, FORGE AI, CHESS AI and PIXELFORGE; project tabs, descriptions, capabilities and technology stacks.
  - **River / Experience:** continuous curved water ribbon, chronological docks and the supplied education / independent development journey.
  - **Summits / Skills:** five angular mountains; capability descriptions and tool groups, without invented percentages.
  - **Falls / Highlights:** two cliff waterfalls; supplied degree and product-development highlights.
  - **Grove / Personal:** instanced trees, path, bench and creative / personal interests.
  - **Bridges / Contact:** physical connection structures, Gurugram location and availability.
  - **Outer Islands / Lab:** satellite islands with clearly labeled experimental directions.
- Smooth eased camera travel to every destination and back, subtle world-view orbit, pointer drag and controlled zoom.
- Real accessible HTML landmark buttons projected from 3D positions, plus raycast selection of architecture.
- Subtle hover scale and illumination; selected landmarks brighten.
- Compact translucent content panels; phone bottom sheets with a separately adjusted camera framing.
- Minimal world index, keyboard navigation, focus states, `M` menu shortcut, Escape to close, a working skip link and reduced-motion support / manual toggle.
- Small minimap with active landmark and camera heading.
- Animated water highlights, waterfall droplets, antenna, a city traffic light and a rare shooting star; the star field stays stationary.
- No image/model asset downloads. Geometry is authored procedurally, merged by material; trees and debris are instanced.
- Capped device pixel ratio, lower mobile complexity, no postprocessing, one desktop shadow-casting directional light, adaptive resolution/shadow/particle degradation and hidden-tab work suspension.
- WebGL initialization and context-loss fallback; optional lightweight portfolio in the World index. All eight content sections work without the graphics module.
- Structured content in `src/data/portfolio.js`; no fake employment, metrics, awards, or certification claims. Missing destination URLs do not render as broken buttons.

## Entry URLs / routes

| Path | Purpose |
| --- | --- |
| `/` or `/index.html` | Cinematic world overview |
| `/#about` | Observatory and profile |
| `/#projects/maya` | MAYA AI |
| `/#projects/forge` | FORGE AI |
| `/#projects/chess` | CHESS AI |
| `/#projects/pixelforge` | PIXELFORGE |
| `/#experience` | Education and independent development timeline |
| `/#skills` | Five capability groups |
| `/#achievements` | Credible highlights |
| `/#personal` | Creative interests and current exploration |
| `/#contact` | Location, availability and configured contact links |
| `/#lab` | Clearly marked experiments |
| `/qa.html` | Opt-in functional test runner; redirects to the actual application |
| `/index.html?selftest=1` | Run checks on the real UI, camera, route and scene budgets |
| `/index.html?selftest=1&inspect=about` | Run checks, then leave the About panel open for visual inspection |
| `/index.html?selftest=1&fallback=1` | Exercise lightweight fallback after functional checks |

Routes use URL fragments; no server rewrite configuration is required. There are no API endpoints. There is no hosted production URL yet; publishing has not been performed.

## Structure

```text
index.html
css/style.css
src/
  main.js                   Independent UI bootstrap and graphics fallback
  data/portfolio.js         Profile, project, timeline, skills and location data
  world/
    materials.js            Reusable material palette
    build-world.js          Procedural geometry, batching, instancing and effects
    renderer.js             Rendering, raycasting, labels and adaptive quality
  camera/navigation.js      Camera travel and OrbitControls
  ui/interface.js           Semantic panels, navigation, deep links and fallback
  tests/checks.js            Opt-in browser assertions
  tests/launch.js            Redirect test entry to the actual application
qa.html
```

## Content, models and storage

All content is static, versioned with the site. No tables, backend, Cloudflare D1 database, local-storage records or user-data collection are needed. Project and location objects are separate from scene code.

- Location: `id`, `name`, `category`, `position`, `cameraPosition`, `cameraTarget`, `labelOffset`, `description`, `content`, `interactions`, optional `secondary`.
- Project: `id`, `name`, `subtitle`, `description`, `functionality`, `technologies`, `status`, `demoUrl`, `githubUrl`, `featured`, `buildingPosition`.
- Profile: identity, role, statement, bio, location, availability, email and professional links.
- Timeline, skills, achievements and experiments are concise structured arrays.

External services: pinned Three.js modules and OrbitControls from jsDelivr; DM Sans and Manrope from Google Fonts, with local system fallbacks. No secrets, protected APIs or AI-service calls. The AI products are portfolio descriptions, not services implemented inside this site.

## Owner input still required / not yet implemented

1. Set `profile.email`, `profile.github`, `profile.linkedin` and `profile.resume` to real destinations. Until then, contact shows a clear unpublished-details note rather than invented contact information.
2. Supply each project's real `demoUrl` and `githubUrl`; unavailable actions are intentionally hidden.
3. Confirm deployment / maintenance status before labeling any project “Live” or “Maintained.” Current data only calls them featured projects.
4. Confirm any certificates before adding them. Unverified Google badges and awards were not added.
5. Review experimental directions against actual work. They are explicitly not represented as finished products.
6. No contact form delivery, CMS, backend authentication, analytics, audio, heavy bloom, physics or third-party 3D models are included.
7. No manual device-lab GPU benchmarking or full automated cross-browser interaction suite has been performed. Browser-render smoke tests do not establish 60 FPS on every physical device.
8. JavaScript is required for the portfolio UI; the graceful fallback is for unavailable WebGL, not browsers with all scripting disabled.

## Development and verification

Serve the folder over HTTP with any static file server. Do not open `index.html` with `file://`: browser ES modules need an HTTP origin. No compilation, package install or build step is required.

Use `/qa.html` to run actual DOM-button navigation through every section, all four project tabs, Escape, motion toggles, camera travel and return, overflow checks and initial scene budgets. Success/failure is logged to the browser console and reflected in `body[data-tests]`. Tests are opt-in, not executed for normal visitors.

The initial desktop rendering measured **88 draw calls / about 15,400 triangles** before the later single-line shooting-star effect. This is a complexity measurement, not a real-device frame-rate guarantee.

Recommended next steps: fill verified links, review the biography and experimental claims, test on representative physical iOS / Android devices and integrated-GPU laptops, then publish. Use the Publish tab for ordinary publishing or explicitly request Hosted Deploy. Changes in the editor are not an already-published production site.
