# CCG Blocks

CCG Blocks is the block-coding editor used in The Cambridge Consultancy Group's AI Programme at [ccg.education](https://ccg.education/editor/). It is the open-source Scratch 3 editor with three changes:

1. **Teachable Machine extension.** Image and sound models trained at teachablemachine.withgoogle.com can be loaded and used in projects. The extension is TM2Scratch by Junya Ishihara, built into the editor.
2. **CCG branding.** CCG Blocks name, logo, favicon and burgundy menu bar. The logo links to ccg.education. The About menu credits the original projects and links to this source code.
3. **Starter projects by link.** `/editor/?project=<path to .sb3>` opens a starter project from the same website, so course pages can open a lesson's starting file directly.

CCG Blocks is not made, endorsed or supported by the Scratch Foundation or MIT. Scratch is a trademark of MIT.

## Licence

GNU Affero General Public License v3 (see `LICENSE`), the licence of both scratch-gui and TM2Scratch. Anyone using the hosted editor can obtain the complete source from this repository plus the pinned upstream commit below.

| Component | Source | Licence |
|---|---|---|
| scratch-gui | github.com/scratchfoundation/scratch-gui, commit in `SCRATCH_GUI_COMMIT` | AGPL-3.0 |
| scratch-vm, scratch-blocks | npm dependencies of scratch-gui, versions fixed by its package-lock.json | AGPL-3.0 |
| TM2Scratch | github.com/champierre/tm2scratch, `overlay/src/extensions/tm2scratch/index.js` (paths adjusted, ml5 self-hosted) | AGPL-3.0 |
| ml5.js | github.com/stretch3/ml5-library, commit cae126e, built with `npm run build`; output in `overlay/static/ml5/` | ml5.js licence (`overlay/static/ml5/LICENSE.md`) |

## How it is built

`build.sh` clones scratch-gui at the pinned commit, installs dependencies, runs `scripts/apply-patches.js`, builds in production mode and assembles the deployable editor in `dist/`.

```sh
./build.sh
```

Requirements: git, Node.js 20 or later, about 6 GB of free memory, and internet access to npm, github.com and downloads.scratch.mit.edu.

`scripts/apply-patches.js` copies everything in `overlay/` into the scratch-gui tree, then makes a small number of find-and-replace edits. If scratch-gui changes so that an expected line is missing, the script stops with a message naming the file, rather than producing a half-patched build.

## Deploying

The contents of `dist/` are copied into the `editor/` folder of the ccg.education website repository and deployed by Netlify. Nothing in the editor needs a server: projects are saved to the user's own computer.

## Files

```
build.sh                     build from scratch
SCRATCH_GUI_COMMIT           pinned upstream commit
scripts/apply-patches.js     the CCG edits to scratch-gui
overlay/                     files added to or replaced in scratch-gui
  src/extensions/tm2scratch/ TM2Scratch extension source
  src/lib/ccg/               registers the extension; ?project= loading
  src/lib/libraries/extensions/tm2scratch/  library card images
  src/components/menu-bar/scratch-logo.svg  CCG Blocks logo
  static/favicon.ico         CCG Blocks icon
  static/ml5/                ml5.js build used by TM2Scratch
site/about.html              About page served at /editor/about.html
```

## Known limits

- The micro:bit firmware download is fetched from downloads.scratch.mit.edu at build time; if that host is unreachable the build must stub it and micro:bit firmware updates will not work.
- Sprite, costume and sound libraries load from Scratch's public asset servers, as in the standard editor.
- There are no user accounts: no cloud saving, sharing or backpack.
