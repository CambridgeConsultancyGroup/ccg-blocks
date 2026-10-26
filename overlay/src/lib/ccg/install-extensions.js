/*
 * CCG Blocks: registers extensions that ship inside this editor build but are not
 * built into the prebuilt scratch-vm package. Wraps ExtensionManager.loadExtensionURL so that
 * both the Extensions library and loading a saved .sb3 file find them by ID.
 */
import TM2Scratch from '../../extensions/tm2scratch/index.js';

const CCG_EXTENSIONS = {
    tm2scratch: TM2Scratch
};

const installCcgExtensions = vm => {
    const manager = vm.extensionManager;
    if (!manager || manager.ccgPatched) return;
    const original = manager.loadExtensionURL.bind(manager);
    manager.loadExtensionURL = extensionURL => {
        const Ext = CCG_EXTENSIONS[extensionURL];
        if (!Ext) return original(extensionURL);
        if (manager.isExtensionLoaded(extensionURL)) return Promise.resolve();
        const instance = new Ext(vm.runtime);
        const serviceName = manager._registerInternalExtension(instance);
        manager._loadedExtensions.set(extensionURL, serviceName);
        return Promise.resolve();
    };
    manager.ccgPatched = true;
};

/*
 * Optional: open a starter project given in the address, e.g. /editor/?project=../starters/l22.sb3
 * Only same-site files are accepted, so a link cannot load a project from another website.
 */
const loadProjectFromQuery = vm => {
    let param;
    try {
        param = new URLSearchParams(window.location.search).get('project');
    } catch (e) {
        return;
    }
    if (!param) return;
    const url = new URL(param, window.location.href);
    if (url.origin !== window.location.origin) return;
    let done = false;
    const load = () => {
        if (done) return;
        done = true;
        vm.removeListener('workspaceUpdate', load);
        fetch(url.href)
            .then(r => {
                if (!r.ok) throw new Error(`Could not load ${url.pathname}`);
                return r.arrayBuffer();
            })
            .then(buffer => vm.loadProject(buffer))
            .catch(err => console.error('CCG Blocks:', err)); // eslint-disable-line no-console
    };
    // Wait until the default project has loaded, then replace it.
    vm.on('workspaceUpdate', load);
};

export {installCcgExtensions, loadProjectFromQuery};
