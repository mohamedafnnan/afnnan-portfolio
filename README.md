# Mohamed Afnnan — Portfolio

Personal portfolio website for Mohamed Afnnan Veettilayil, an Electronics and Instrumentation Engineering undergraduate at FISAT. The site brings together documented engineering work, editorial design, technical writing, certificates, recognition, community projects, and an interactive 3D portfolio field.

## Deployment

- **GitHub Pages target:** <https://mohamedafnnan.github.io/afnnan-portfolio/>
- **DAWN 3D experience:** <https://mohamedafnnan.github.io/afnnan-portfolio/dawn/>
- **Previous Netlify deployment:** <https://mohamed-afnnan-portfolio.netlify.app/>

GitHub Pages deployment is automated by `.github/workflows/pages.yml`. Every push to `main` builds the static site and publishes it through GitHub Actions. The workflow prepares the project for GitHub's repository subpath (`/afnnan-portfolio/`), so root-relative assets and DAWN's Three.js/Rapier imports resolve correctly.

The GitHub Pages URL becomes available after the first successful Actions deployment. The previous Netlify deployment is retained as a fallback and is not changed by this workflow.

## What is included

The main portfolio covers selected work such as DAWN, METRON Vol. IX, Instrumentation101, the School EVM project, the Hairpin Bend Traffic System, and Navodhayam. The evidence archive includes the METRON magazine PDF, certificates, recognition documents, posters, and the faculty briefing material supplied for the portfolio.

DAWN is a self-contained Three.js and Rapier interactive portfolio field. It presents engineering interests, publication design, evidence, and independent learning as an explorable environment rather than a flat list of projects.

## Interactive portfolio

The main page now includes an interactive control-room and workshop layer:

- A simulated SCADA panel with instrument readings, pump/valve toggles and an event log. It is a local demonstration only; it is not connected to a PLC, plant or live equipment.
- A two-link robotic-arm pick-and-place animation with automatic cycle, pause and pointer-tracking modes.
- A searchable certificate museum using the evidence files already in the repository.
- A bookshelf that navigates to portfolio sections, a local IndexedDB memory wall, a playable pointer/touch table-tennis rally, and a downloadable SVG business card and vCard.
- A voice-enabled intro and optional speech-recognition greeting. Browser support and microphone permission vary.
- A public guestbook backed by GitHub issue #3. Visitors can read public comments on the site and sign through GitHub; posting requires a GitHub account. Do not post private information.
- Project disassembly panels, a magnetic cursor on pointer devices, and keyboard/tap Easter eggs.

The memory wall is intentionally local to each visitor's browser. It does not upload photos or create a shared gallery. The guestbook uses GitHub Issues because GitHub Pages is static and has no server-side database.

## DAWN runtime

DAWN uses:

- Three.js for rendering and scene composition
- Rapier for terrain and rover physics
- Procedural geology, terrain, particles, and lightweight effects
- An optimized detailed rover option using `dawn-chassis-opt.glb` and `dawn-arm-opt.glb`
- A procedural rover option for fast startup and lower-end devices
- Responsive desktop and mobile layouts
- Portfolio-focused field notes, missions, HUD, map, tour, and evidence locations

The loading screen defaults to the procedural rover so the experience is not blocked by CAD decoding. Users can switch to the detailed rover model using the loading-screen toggle. The startup path has a bounded detailed-model fallback and a refreshed service-worker cache.

## Controls

- `W` `A` `S` `D` — move
- `Space` — brake
- `E` — open a nearby field note
- `M` — open the map/index
- `T` — guided tour
- `C` — camera
- `P` — photo mode
- `?` — help

On mobile, use the on-screen touch controls.

## Performance notes

The previous live deployment was tested at desktop `1440 × 900` and mobile `390 × 844` viewport sizes.

- Desktop DAWN boot: approximately 9 seconds
- Mobile DAWN boot: approximately 7 seconds
- Both modes reached `Field online — press ROLL OUT`
- No failed network requests or JavaScript page errors were observed in that earlier deployment
- Procedural mode transfers approximately 2.3 MB of runtime resources
- Detailed GLBs are opt-in rather than part of the default boot path
- Mobile terrain and geological instance density are reduced automatically

The main portfolio transferred approximately 526 KB during the earlier browser audit. These figures describe the previous deployment and have not yet been re-measured on GitHub Pages.

## Project structure

```text
.
├── index.html                 # Main portfolio page
├── portfolio.css              # Main portfolio styling
├── portfolio.js               # Main portfolio interactions
├── interactive.css            # Interactive experience styling
├── interactive.js             # Interactive portfolio features
├── assets/                    # Evidence, publications, images, fonts
├── dawn/
│   ├── index.html             # DAWN entry screen
│   ├── dawn.css               # DAWN interface styling
│   ├── assets/rover/          # Optimized rover GLBs
│   ├── src/                   # Three.js, Rapier, HUD, missions, scene code
│   └── vendor/                # Local Three.js and Rapier runtime files
├── .github/workflows/
│   └── pages.yml              # GitHub Pages build and deployment
├── manifest.webmanifest       # PWA metadata
└── sw.js                      # Versioned service-worker shell cache
```

## Local preview

This is a static site. From the repository root, run:

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173/> for the portfolio and <http://localhost:4173/dawn/> for DAWN.

## Deployment details

No bundler or server-side runtime is required for the current site. GitHub Actions copies the static project into a Pages artifact and adjusts root-relative paths for the repository URL. The deployment workflow runs on pushes to `main` and can also be started manually from the repository's Actions tab.
