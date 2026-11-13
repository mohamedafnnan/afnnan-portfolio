# Mohamed Afnnan — Portfolio

Personal portfolio website for Mohamed Afnnan Veettilayil, an Electronics and Instrumentation Engineering undergraduate at FISAT. The site brings together documented engineering work, editorial design, technical writing, certificates, recognition, community projects, and an interactive 3D portfolio field.

## Live links

- **Portfolio:** <https://mohamed-afnnan-portfolio.netlify.app/>
- **DAWN interactive experience:** <https://mohamed-afnnan-portfolio.netlify.app/dawn/>
- **Netlify project:** <https://app.netlify.com/projects/mohamed-afnnan-portfolio>

## What is included

The main portfolio covers selected work such as DAWN, METRON Vol. IX, Instrumentation101, the School EVM project, the Hairpin Bend Traffic System, and Navodhayam. The evidence archive includes the METRON magazine PDF, certificates, recognition documents, posters, and the faculty briefing material supplied for the portfolio.

DAWN is a self-contained Three.js and Rapier interactive portfolio field. It presents engineering interests, publication design, evidence, and independent learning as an explorable environment rather than a flat list of projects.

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

The live deployment was tested at desktop `1440 × 900` and mobile `390 × 844` viewport sizes.

- Desktop DAWN boot: approximately 9 seconds
- Mobile DAWN boot: approximately 7 seconds
- Both modes reached `Field online — press ROLL OUT`
- No failed network requests or JavaScript page errors were observed
- Procedural mode transfers approximately 2.3 MB of runtime resources
- Detailed GLBs are opt-in rather than part of the default boot path
- Mobile terrain and geological instance density are reduced automatically

The main portfolio transferred approximately 526 KB during the live browser audit.

## SEO status

The deployed pages include page titles, meta descriptions, Open Graph metadata, structured headings, HTTPS, responsive layouts, and image alternative text. Canonical URLs, `robots.txt`, `sitemap.xml`, and JSON-LD structured data remain possible future improvements.

## Project structure

```text
.
├── index.html                 # Main portfolio page
├── portfolio.css              # Main portfolio styling
├── portfolio.js               # Main portfolio interactions
├── assets/                    # Evidence, publications, images, fonts
├── dawn/
│   ├── index.html             # DAWN entry screen
│   ├── dawn.css               # DAWN interface styling
│   ├── assets/rover/          # Optimized rover GLBs
│   ├── src/                   # Three.js, Rapier, HUD, missions, scene code
│   └── vendor/                # Local Three.js and Rapier runtime files
├── manifest.webmanifest       # PWA metadata
└── sw.js                      # Versioned service-worker shell cache
```

## Local preview

This is a static site. From the repository root, run:

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173/> for the portfolio and <http://localhost:4173/dawn/> for DAWN.

## Deployment

The site is deployed to Netlify from this static project root. The public GitHub repository is the source for the current project history, while the Netlify site serves the production deployment.
