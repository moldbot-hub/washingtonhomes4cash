# Premium buyer-site visual release — September 5, 2026

Navy and copper with direct sans-serif type, a house portrait beside the opening text, structured condition notes and a property inquiry after the process explanation.

The 11 existing root HTML pages use the new typography, controls, responsive layouts, site-specific image and social preview. The homepage has its own composition and contact placement. AI image captions distinguish the concept imagery from completed purchases. Images are local responsive WebP files; each site owns its JPG social preview. This site needs no controller import, build step or newly generated media at runtime. Publish the repository root as the static site.

The about page identifies Washington Home Solutions LLC, UBI 606259805, as verified active in the official Washington registry on September 5, 2026. It links to the registry and separates company registration from purchase agreement terms and separate city offices. No address was added.

Existing H1s, titles, meta descriptions, robots directives, canonical links, form elements, telephone destinations and original scripts were compared with baseline 7f72de473f6a669b5a08af8bb713e65f0180d552 and preserved. Campaign configuration and source attribution code were not changed. The only new JavaScript closes the mobile menu with Escape or a link and respects reduced motion for anchor navigation. Some contradictory blanket cost/closing claims in the body were qualified to refer to the written agreement and settlement statement; this was not a comprehensive rewrite of inherited marketing copy or metadata.

## Verification

- `node --test tests/*.test.cjs`: 3 tests passed, none failed.
- Local Chromium checks: all 11 HTML pages passed at 1365px desktop and 390px mobile. No horizontal overflow, page errors or missing local resources. Each has one H1, a site-specific social preview and preserved content/form/script contracts.
- Mobile menu opening and Escape closing, plus existing FAQ expansion, passed where present.
- Homepage and get-offer form submissions were intercepted locally and returned the success UI with this domain as their source. No live lead was delivered.

The machine-readable browser receipt is `premium-visuals-browser-qa.json`. Image generation provenance, dimensions and derivative hashes are recorded in `assets/identity/provenance.json`. Browser verification confirms the local static implementation; it is not a production delivery or ranking claim. This commit is prepared for the coordinated portfolio release and has not been pushed or deployed by this task.
