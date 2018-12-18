/**
 * Created by kib357 on 18/02/16.
 */

module.exports = {
    run: {
        display: "list",
        navOrder: 100,
        navGroup: "config",
        label: "{{$i18n.storeLabel}}",
        labels: [],
        props: {
            name: {
                type: "string",
                label: "Script name",
                default: "New script",
            },
            code: {
                type: "string",
                display: "codeEditor",
                formOrder: 10,
            },
            run: {
                type: "action",
                actions: [{ _id: "run" }],
                formOrder: 20,
            },
            response: {
                type: "string",
                display: "code",
                formOrder: 30,
            },
        },
        actions: [
            {
                _id: "run",
                label: "Выполнить",
                disableItemReadyCheck: true,
                clientPreScript: function($item) {
                    return {
                        code: $item.code,
                    };
                },
                script: async ($db, $data, $item) => {
                    const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
                    const fn = new AsyncFunction("$db", "$item", "require", $data.code);
                    try {
                        const res = await fn($db, $item, require);
                        if (typeof res === "string") {
                            return $db.set("run", { _id: $item._id, response: res });
                        }

                        return $db.set("run", { _id: $item._id, response: JSON.stringify(res, null, "\t") });
                    } catch (err) {
                        if (typeof err === "string") {
                            return $db.set("run", { _id: $item._id, response: "Error: " + err });
                        }

                        return $db.set("run", {
                            _id: $item._id,
                            response: "Error: " + JSON.stringify(err.message, null, "\t"),
                        });
                    }
                },
            },
        ],
        objectLifeCycle: {},
        storeLifeCycle: {},
        filters: {},
        httpHooks: [],
        tasks: [],
        i18n: {
            storeLabel: "Run JS",
        },
        access: [{ role: "root", permissions: "vcrudx" }],
    },
};
