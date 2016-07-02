function notImplemented(name, res) {
    console.warn(`Not implemented function '${name}' called!`);
    return res;
}
global.$db = {
    waitForConnection: notImplemented.bind(this, "waitForConnection", new Promise((f, r) => { })),
};