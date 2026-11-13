/* DAWN — Mohamed Afnnan portfolio field experience.
   The world is an interactive presentation layer for engineering, editorial work,
   evidence, and independent learning. Locations are narrative UI, not claims of
   a separate organization or external project record. */

export const ABOUT_FULL = 'DAWN is a personal interactive portfolio experience by Mohamed Afnnan Veettilayil — a way to move through engineering interests, documented work, publication design, and evidence instead of reading them as a flat list.';
export const BUILT_FULL = 'This experience turns a portfolio into a navigable field: rover systems represent engineering practice, the archive represents evidence, and the route between them represents learning through making, writing, and investigation.';

export const COMPONENTS = [
  { name: 'Systems thinking', icon: '⌘', desc: 'A portfolio thread about understanding how parts, measurements, and decisions connect inside a larger system.' },
  { name: 'Embedded & robotics', icon: '⚙', desc: 'Interests shaped by microcontrollers, edge hardware, IoT, rover work, and the practical questions behind physical systems.' },
  { name: 'Instrumentation', icon: '⌁', desc: 'The discipline of making a process legible: measuring what is happening and deciding what to do next.' },
  { name: 'Writing & documentation', icon: '✎', desc: 'Technical writing and documentation that help another person follow the work, not just admire the result.' },
  { name: 'Editorial design', icon: '▤', desc: 'Print and screen systems developed through METRON Vol. IX, HTML/CSS layout, typography, and page structure.' },
  { name: 'Community projects', icon: '◎', desc: 'Projects such as Navodhayam that combine structured information with direct human guidance.' },
];

export const DAWN_FACTS = {
  what: 'DAWN is a personal portfolio interface by Mohamed Afnnan Veettilayil.',
  suspension: 'The rover stands in for practical engineering: systems need structure, feedback, and resilience.',
  arm: 'The manipulator represents close attention to interfaces, mechanisms, and the details that make a system usable.',
  autonomy: 'The route is self-directed: explore the work, collect field notes, and build your own reading of the portfolio.',
  competition: 'The portfolio connects engineering, investigation, communication, and community-facing work.',
};

export const IRC_2026 = {
  title: 'Portfolio Field Note 2026',
  venue: 'Mohamed Afnnan / Evidence Archive',
  day01: 'A first pass through the archive: publication design, certificates, project notes, and the people-facing work around Navodhayam.',
  note: 'This is portfolio narrative, not an external competition record.',
};

export const PORTFOLIO_NOTE = {
  title: 'Portfolio Field Note',
  day01: 'The field is a guided way to read engineering interests, editorial work, evidence, and independent learning.',
  note: 'Each marker is a portfolio interface, not a claim about an external organization or competition record.',
};

export const FACTORY_PROJECTS = [
  { name: 'METRON Vol. IX', blurb: 'A completed EIE department annual developed through editorial direction, HTML/CSS layout, and print-ready page design.' },
  { name: 'Navodhayam', blurb: 'A FISAT KEAM Helpdesk initiative that combines cutoff data with department-specific student guidance.' },
];

export const SDDR = {
  name: 'Evidence Review',
  blurb: 'A portfolio review point for reading the work alongside its supporting files: certificates, publication material, and project documentation.'
};

/* ---------------- World layout (fictional Mars-analogue outpost) ---------------
   Coordinate system: x = east, z = south. Base near origin. Destinations are
   compacted into a practical exploration area while preserving their relative layout.
   `kind` drives which 3D facility structure is built. */
const RAW_WORLD_POIS = [
  { id: 'dawn-base',        name: 'DAWN Base',            pos: [0, 0],        color: 0xf2a35d, kind: 'base',    zone: 'base' },
  { id: 'mission-control',  name: 'Mission Control',      pos: [46, -30],     color: 0x7fd0d4, kind: 'control', zone: 'base' },
  { id: 'meet-dawn',        name: 'Meet DAWN',            pos: [-8, 10],      color: 0xff9a3c, kind: 'pad',     zone: 'base' },

  { id: 'mechanical-bay',   name: 'Mechanical Bay',       pos: [-64, 40],     color: 0xe07a3a, kind: 'garage',  zone: 'engineering' },
  { id: 'electrical-bay',   name: 'Electrical Bay',       pos: [-84, 12],     color: 0xf5c96b, kind: 'lab',     zone: 'engineering' },
  { id: 'control-bay',      name: 'Control Bay',          pos: [-74, -22],    color: 0x7fd0d4, kind: 'lab',     zone: 'engineering' },
  { id: 'autonomy-bay',     name: 'AI & Autonomy Bay',    pos: [-48, -52],    color: 0xc084ff, kind: 'lab',     zone: 'engineering' },
  { id: 'workshop',         name: 'Engineering Workshop', pos: [-96, -48],    color: 0xe07a3a, kind: 'garage',  zone: 'engineering' },
  { id: 'arm-demo',         name: 'Robotic Arm Range',    pos: [-116, -16],   color: 0xc084ff, kind: 'arm',     zone: 'engineering' },

  { id: 'testing-grounds',  name: 'Rover Testing Grounds',pos: [92, 46],      color: 0xa3b3c2, kind: 'range',   zone: 'testing' },
  { id: 'comms-station',    name: 'Communications Station',pos: [120, -64],   color: 0x7fd0d4, kind: 'tower',   zone: 'testing' },
  { id: 'solar-field',      name: 'Power & Solar Field',  pos: [30, 108],     color: 0xf5c96b, kind: 'solar',   zone: 'testing' },

  { id: 'field-research',   name: 'Field Research Zone',  pos: [-30, 150],    color: 0x8adb8a, kind: 'dome',    zone: 'field' },
  { id: 'evidence-archive',     name: 'Evidence Archive', pos: [-120, 118], color: 0xd5c07a, kind: 'monument', zone: 'field' },
  { id: 'irc-memorial',     name: 'IRC 2026 Memorial',    pos: [60, -120],    color: 0xe07a3a, kind: 'monument', zone: 'field' },
  { id: 'sddr-review',      name: 'SDDR Review Pavilion', pos: [140, 30],     color: 0xa3b3c2, kind: 'dome',    zone: 'field' },
  { id: 'portfolio-archive',      name: 'Portfolio Archive', pos: [-150, -96], color: 0x8adb8a, kind: 'hub', zone: 'field' },

  { id: 'observation-ridge',name: 'Observation Ridge',    pos: [150, 130],    color: 0xf2a35d, kind: 'ridge',   zone: 'far' },
  { id: 'south-canyon',     name: 'South Canyon',         pos: [-120, -170],  color: 0xc084ff, kind: 'gallery', zone: 'far' },
  { id: 'east-craters',     name: 'East Crater Field',    pos: [185, -20],    color: 0xa3b3c2, kind: 'range',   zone: 'far' },
  { id: 'far-gate',         name: 'Far Gate',             pos: [-40, -190],   color: 0xf5c96b, kind: 'pad',     zone: 'far' },
];

// POI coordinates stay in the same relative layout, but the playable distances are compacted.
export const WORLD_POIS = RAW_WORLD_POIS.map((poi) => ({
  ...poi,
  pos: [poi.pos[0] * 0.62, poi.pos[1] * 0.62],
}));

/* Mission progression: a natural arc, each step points at a POI and an objective. */
export const MISSIONS = [
  { id: 'roll-out',   poi: 'meet-dawn',        title: 'Roll Out',            brief: 'Drive DAWN off the pad and reach the inspection marker.' },
  { id: 'meet-dawn',  poi: 'meet-dawn',        title: 'Meet DAWN',           brief: 'Inspect the authentic DAWN rover up close. Press E at the marker.' },
  { id: 'engineering',poi: 'mechanical-bay',   title: 'Engineering',         brief: 'Visit the four engineering bays. Start at Mechanical.' },
  { id: 'testing',    poi: 'testing-grounds',  title: 'Test DAWN',           brief: 'Take DAWN through the Testing Grounds. Feel the suspension work.' },
  { id: 'field',      poi: 'field-research',   title: 'Into the Field',      brief: 'Head beyond the base into the Field Research Zone.' },
  { id: 'people',     poi: 'evidence-archive',     title: 'Evidence Archive',   brief: 'Inspect certificates, publication files, and project notes from the portfolio.' },
  { id: 'irc',        poi: 'irc-memorial',     title: 'IRC 2026',            brief: 'Relive Day 01 of the International Rover Challenge.' },
  { id: 'sddr',       poi: 'sddr-review',      title: 'SDDR',                brief: 'Read about the team\u2019s design & development review.' },
  { id: 'beyond',     poi: 'portfolio-archive',      title: 'Portfolio Archive',  brief: 'Connect the interactive field to the wider portfolio archive.' },
  { id: 'ridge',      poi: 'observation-ridge',title: 'Observation Ridge',   brief: 'Climb the ridge and look back over everything you explored.' },
  { id: 'free',       poi: null,               title: 'Free Exploration',    brief: 'The outpost is yours. Find every field log.' },
];

/* ---------------- The 21 field logs ----------------
   kind: 'portfolio' (portfolio context) or 'field' (fictional interactive layer). */
export const FIELD_LOGS = [
  { id: 'log-01', poi: 'dawn-base',        kind: 'real',  title: 'Touchdown', body: `Mission origin established. ${DAWN_FACTS.what}` },
  { id: 'log-02', poi: 'meet-dawn',        kind: 'real',  title: 'The Machine', body: `${DAWN_FACTS.suspension} ${DAWN_FACTS.arm}` },
  { id: 'log-03', poi: 'mission-control',  kind: 'real',  title: 'Mission Context', body: `Interactive mission node. ${DAWN_FACTS.competition} The official site does not publish a separate Mission Control facility.` },
  { id: 'log-04', poi: 'mechanical-bay',   kind: 'real',  title: 'Mechanical', body: `The Mechanical discipline builds DAWN\u2019s chassis, advanced suspension, and wheels \u2014 everything that has to survive a Mars-analogue run.` },
  { id: 'log-05', poi: 'electrical-bay',   kind: 'real',  title: 'Electrical', body: `The Electrical discipline keeps DAWN powered and alive \u2014 wiring, drivers, and the systems behind the rover.` },
  { id: 'log-06', poi: 'control-bay',      kind: 'real',  title: 'Control', body: `The Control discipline is where the operator meets the machine \u2014 the interface between a command and DAWN\u2019s movement.` },
  { id: 'log-07', poi: 'autonomy-bay',     kind: 'real',  title: 'AI & Autonomy', body: `${DAWN_FACTS.autonomy} The AI & Autonomy discipline works on how DAWN finds its way.` },
  { id: 'log-08', poi: 'workshop',         kind: 'real',  title: 'The Workshop', body: `Built through interdisciplinary collaboration in mechanical, electronics, and software engineering \u2014 this is where DAWN is fabricated and tested.` },
  { id: 'log-09', poi: 'arm-demo',         kind: 'real',  title: 'The Arm', body: `${DAWN_FACTS.arm} This range is where the manipulator\u2019s precision is demonstrated.` },
  { id: 'log-10', poi: 'testing-grounds',  kind: 'field', title: 'Mars-Analogue Test Range', body: `Interactive field note — this playable test range is part of the interactive portfolio field; it represents an engineering context rather than a published external location.` },
  { id: 'log-11', poi: 'comms-station',    kind: 'field', title: 'Interactive Uplink', body: `Interactive field note — the official source lists Electrical and Controls as team disciplines but does not publish a separate communications-station location.` },
  { id: 'log-12', poi: 'solar-field',      kind: 'field', title: 'Interactive Power Zone', body: `Interactive field note — this playable power zone is part of the interactive portfolio field; it represents a systems-learning context.` },
  { id: 'log-13', poi: 'field-research',   kind: 'field', title: 'Scientific Mission Context', body: `Interactive field note — the official site says DAWN is designed to complete complex scientific and maintenance tasks in Mars-analogue environments; this field location is part of the playable layer.` },
  { id: 'log-14', poi: 'evidence-archive',     kind: 'real',  title: 'Evidence Archive', body: `Every bolt on DAWN has a name attached. Open the archive to meet the patrons, mentors, and the team across AI & Autonomy, Electrical, Controls, Design, Design & Manufacturing, Science, and Research & Documentation.` },
  { id: 'log-15', poi: 'irc-memorial',     kind: 'real',  title: 'IRC 2026 — Day 01', body: `${IRC_2026.day01} (${IRC_2026.venue}.)` },
  { id: 'log-16', poi: 'sddr-review',      kind: 'real',  title: 'SDDR', body: SDDR.blurb },
  { id: 'log-17', poi: 'portfolio-archive',      kind: 'real',  title: 'Portfolio Archive', body: `The team\u2019s work extends past the rover. FISAT Robotics Factory projects include the Surveillance Robocat and the Brain Controlled Assistive System.` },
  { id: 'log-18', poi: 'observation-ridge',kind: 'field', title: 'Interactive Overlook', body: `Interactive field note — the official source does not publish an observation-ridge location. This node represents the survey view across the DAWN Mars-analogue experience.` },
  { id: 'log-19', poi: 'south-canyon',     kind: 'field', title: 'Interactive Terrain', body: `Interactive field note — the official source does not publish a South Canyon location. This node represents terrain used by the DAWN experience.` },
  { id: 'log-20', poi: 'east-craters',     kind: 'field', title: 'Interactive Terrain', body: `Interactive field note — the official source does not publish an East Crater Field location. This node represents rough-terrain testing in the DAWN experience.` },
  { id: 'log-21', poi: 'far-gate',         kind: 'field', title: 'Interactive Waypoint', body: `Interactive field note — the official source does not publish a Far Gate location. This marker is the edge of the playable survey area.` },
];
