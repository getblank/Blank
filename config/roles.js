module.exports = {
    _roles: {
        type: "map",
        entries: {
            root: {
                label: "root",
                display: "none",
            },
            admin: {
                label: "{{$i18n.$settings.common.administrator}}",
            },
            all: {
                label: "all",
                display: "none",
            },
        },
    },
};
