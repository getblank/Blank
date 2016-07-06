function toObject(val) {
    if (val === null || val === undefined) {
        throw new TypeError("merge cannot be called with null or undefined");
    }

    return Object(val);
}

module.exports = function merge(target) {
    var from;
    var to = toObject(target);

    for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);

        for (var key of Object.keys(from)) {
            if ((Array.isArray(to[key]) || to[key] == null) && Array.isArray(from[key])) {
                to[key] = to[key] || [];
                if (from[key][0] === "...") {
                    to[key] = to[key].concat(from[key].slice(1));
                } else {
                    to[key] = from[key].slice();
                }
                continue;
            }
            if ((typeof to[key] === "object" || to[key] == null) && typeof from[key] === "object") {
                to[key] = to[key] || {};
                merge(to[key], from[key]);
                continue;
            }
            to[key] = from[key];
        }
    }

    return to;
}