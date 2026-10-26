#!/usr/bin/env node
/*
 * CCG Blocks: applies the CCG changes to a clean scratch-gui checkout.
 * Usage: node scripts/apply-patches.js <path-to-scratch-gui>
 * Every edit is a find-and-replace on a known line; the script stops if a line is not found,
 * which means scratch-gui changed and the patch needs updating.
 */
const fs = require('fs');
const path = require('path');

const gui = path.resolve(process.argv[2] || 'scratch-gui');
const overlay = path.resolve(__dirname, '..', 'overlay');

const copyDir = (from, to) => {
    for (const entry of fs.readdirSync(from, {withFileTypes: true})) {
        const src = path.join(from, entry.name);
        const dest = path.join(to, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(dest, {recursive: true});
            copyDir(src, dest);
        } else {
            fs.copyFileSync(src, dest);
        }
    }
};

const edit = (rel, find, replace) => {
    const file = path.join(gui, rel);
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes(replace)) return; // already applied
    if (!text.includes(find)) {
        throw new Error(`Patch failed: could not find expected text in ${rel}:\n${find}`);
    }
    fs.writeFileSync(file, text.replace(find, replace));
    console.log(`patched ${rel}`);
};

// 1. Copy new files (extension source, icons, logo, ml5, favicon).
copyDir(overlay, gui);
console.log('copied overlay files');

// 2. Register CCG extensions on the editor's VM, and allow ?project= starter files.
edit('src/reducers/vm.js',
    'defaultVM.attachStorage(storage);',
    `defaultVM.attachStorage(storage);
installCcgExtensions(defaultVM); // CCG
loadProjectFromQuery(defaultVM); // CCG`);
edit('src/reducers/vm.js',
    "import storage from '../lib/storage';",
    `import storage from '../lib/storage';
import {installCcgExtensions, loadProjectFromQuery} from '../lib/ccg/install-extensions.js'; // CCG`);

// 3. Add TM2Scratch to the Extensions library, first in the list.
edit('src/lib/libraries/extensions/index.jsx',
    'export default [',
    `import tm2scratchIconURL from './tm2scratch/tm2scratch.png'; // CCG
import tm2scratchInsetIconURL from './tm2scratch/tm2scratch-small.png'; // CCG

export default [
    { // CCG: Teachable Machine models, from TM2Scratch by Junya Ishihara
        name: 'Teachable Machine',
        extensionId: 'tm2scratch',
        collaborator: 'TM2Scratch by Junya Ishihara',
        iconURL: tm2scratchIconURL,
        insetIconURL: tm2scratchInsetIconURL,
        description: 'Use image and sound models you trained in Teachable Machine.',
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        bluetoothRequired: false
    },`);

// 4. Logo goes to the CCG site; About menu credits Scratch and links to the source code (AGPL).
edit('src/playground/render-gui.jsx',
    "window.location = 'https://scratch.mit.edu';",
    "window.location = '/'; // CCG: back to ccg.education");
edit('src/playground/render-gui.jsx',
    `                backpackVisible
                showComingSoon
                backpackHost={backpackHost}
                canSave={false}
                onClickLogo={onClickLogo}`,
    `                backpackHost={backpackHost}
                canSave={false}
                onClickLogo={onClickLogo}
                onClickAbout={[ // CCG
                    {title: 'About CCG Blocks', onClick: () => window.open('about.html', '_blank')},
                    {title: 'Source code', onClick: () => window.open('https://github.com/CambridgeConsultancyGroup/ccg-blocks', '_blank')}
                ]}`);

// 5. Page title and menu bar colour.
edit('webpack.config.js',
    "template: 'src/playground/index.ejs',\n        title: 'Scratch 3.0 GUI'",
    "template: 'src/playground/index.ejs',\n        title: 'CCG Blocks'");
// Build only the editor page (not the developer examples or the npm library), which also keeps
// the production build within a modest amount of memory.
edit('webpack.config.js',
    `            gui: './src/playground/index.jsx',
            blocksonly: './src/playground/blocks-only.jsx',
            compatibilitytesting: './src/playground/compatibility-testing.jsx',
            player: './src/playground/player.jsx'`,
    `            gui: './src/playground/index.jsx' // CCG: editor only`);
edit('webpack.config.js',
    `module.exports = buildDist ?
    [buildConfig.get(), distConfig.get()] :
    buildConfig.get();`,
    `module.exports = buildDist && process.env.CCG_BUILD_DIST ? // CCG: editor only unless asked
    [buildConfig.get(), distConfig.get()] :
    buildConfig.get();`);
edit('src/components/menu-bar/menu-bar.css',
    'background-color: $looks-secondary;',
    'background-color: #6E1E2B; /* CCG burgundy */');

console.log('CCG patches applied');
