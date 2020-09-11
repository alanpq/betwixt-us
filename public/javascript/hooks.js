export const preloadHooks = [];
export const hookPreload = (cb) => {
    preloadHooks.push(cb)
}