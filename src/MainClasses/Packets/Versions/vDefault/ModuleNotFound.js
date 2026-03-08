export class ModuleNotFound extends Error { }

export default (() => { 
    throw new ModuleNotFound(
        'This is a stub for base modules of specific versions or those that do not have a base class. If you see this error, then one of the modules inside the loader config was not found in the final version folders, so it loaded this function from the default loading path.'
    ) })()