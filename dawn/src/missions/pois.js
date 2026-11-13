/* DAWN — portfolio-only point-of-interest copy for Mohamed Afnnan. */
import { DAWN_FACTS, PORTFOLIO_NOTE, SDDR, FACTORY_PROJECTS, ABOUT_FULL, BUILT_FULL, COMPONENTS } from '../data.js';

export const POI_LOG_BODY = {
  'dawn-base': `<p><strong>Start Here.</strong></p><p>${ABOUT_FULL}</p>`,
  'mission-control': `<p><strong>Portfolio Overview.</strong></p><p>${DAWN_FACTS.competition}</p>`,
  'meet-dawn': `<p><strong>About the Work.</strong></p><p>${BUILT_FULL}</p><h3 style="margin:14px 0 8px;font-size:15px;letter-spacing:.08em;color:#ffb066">WORKING THREADS</h3>${COMPONENTS.map(cmp => `<div class="comp"><div class="comp__h">${cmp.icon} <b>${cmp.name}</b></div><p>${cmp.desc}</p></div>`).join('')}`,
  'mechanical-bay': `<p><strong>Build.</strong></p><p>Structure, hardware, and practical iteration form the build thread. The question is simple: what can be made clearer, stronger, or more useful?</p>`,
  'electrical-bay': `<p><strong>Measure.</strong></p><p>Signals, instrumentation, and readable information form the measure thread. Good work makes the important state visible.</p>`,
  'control-bay': `<p><strong>Interface.</strong></p><p>This is where an intention becomes an action. The portfolio treats interface design as both a technical and human responsibility.</p>`,
  'autonomy-bay': `<p><strong>Learn.</strong></p><p>${DAWN_FACTS.autonomy}</p>`,
  'workshop': `<p><strong>Make &amp; Test.</strong></p><p>Build, test, document, and improve. The workshop is the part of the portfolio that stays unfinished on purpose.</p>`,
  'arm-demo': `<p><strong>Precision.</strong></p><p>Small interfaces and mechanical details shape how a system is understood and used. Precision is a communication skill as much as a technical one.</p>`,
  'testing-grounds': `<p><strong>Selected Projects.</strong></p><p>This marker gathers practical work and its context: what was attempted, what was learned, and what evidence remains.</p>`,
  'comms-station': `<p><strong>Writing Desk.</strong></p><p>Technical material becomes useful when another person can follow it. This is the space for documentation, explanation, and clear signals.</p>`,
  'solar-field': `<p><strong>Efficiency.</strong></p><p>Precision, efficiency, and improving systems without wasting resources are recurring design questions.</p>`,
  'field-research': `<p><strong>Questions.</strong></p><p>Independent learning starts by asking what a system is actually doing, then looking for evidence before reaching a conclusion.</p>`,
  'evidence-archive': `<p><strong>Evidence Archive.</strong></p><p>Open the portfolio files: METRON Vol. IX, certificates, recognition, and supporting project documents.</p>`,
  'portfolio-milestone': `<p><strong>${PORTFOLIO_NOTE.title}.</strong></p><p>${PORTFOLIO_NOTE.day01}</p><p><em>${PORTFOLIO_NOTE.note}</em></p>`,
  'sddr-review': `<p><strong>${SDDR.name}.</strong></p><p>${SDDR.blurb}</p>`,
  'portfolio-archive': `<p><strong>Selected Work.</strong></p><p>Two portfolio threads sit here:</p><ul>${FACTORY_PROJECTS.map(p => `<li><strong>${p.name}</strong> — ${p.blurb}</li>`).join('')}</ul>`,
  'observation-ridge': `<p><strong>Perspective.</strong></p><p>From here, the portfolio reads as one connected view across engineering, writing, design, community, and learning.</p>`,
  'south-canyon': `<p><strong>Drafts.</strong></p><p>Progress can be uneven. The useful response is to observe, document, revise, and try again.</p>`,
  'east-craters': `<p><strong>Constraints.</strong></p><p>Every project has constraints and trade-offs worth making visible. Clarity begins when the limits are named.</p>`,
  'far-gate': `<p><strong>Next Question.</strong></p><p>The edge of the current record, where the next project, certificate, or field note can begin.</p>`,
};
