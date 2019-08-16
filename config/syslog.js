/**
 * Created by kib357 on 18/02/16.
 */

module.exports = {
    syslog: {
        display: "table",
        navOrder: 90,
        navGroup: "config",
        label: "{{$i18n.storeLabel}}",
        labels: [],
        orderBy: "-createdAt",
        tableColumns: ["createdAt", "actionSource", "userName", "store", "itemId", "action", "actionData", "result"],
        props: {
            _id: {
                type: "int",
            },
            createdAt: {
                type: "date",
                label: "DateTime",
            },
            store: {
                type: "string",
                label: "Store",
                display: "text",
            },
            userId: {
                type: "ref",
                store: "users",
                populateIn: "user",
                display: "none",
                readOnly: true,
            },
            userName: {
                type: "virtual",
                label: "User",
                load($item) {
                    return $item.user ? $item.user.name : "";
                },
            },
            itemId: {
                type: "string",
                label: "Item Id",
                display: "none",
            },
            actionSource: {
                display: "select",
                options: [
                    { value: "JS", label: "JavaScript API" },
                    { value: "WAMP", label: "WAMP API" },
                    { value: "HTTP", label: "HTTP API" },
                    { value: "System", label: "System" },
                ],
            },
            action: {
                type: "string",
                label: "Action",
                display: "text",
            },
            actionData: {
                type: "any",
                label: "Action data",
                display: "text",
            },
            result: {
                type: "any",
                display: "text",
                label: "Result",
            },
        },
        actions: [],
        objectLifeCycle: {},
        storeLifeCycle: {},
        filters: {},
        httpHooks: [],
        tasks: [],
        access: [
            {
                role: "root",
                permissions: "vcrud",
            },
        ],
        i18n: {
            ru: {
                storeLabel: "Журнал операций",
            },
            en: {
                storeLabel: "Actions history",
            },
        },
    },
};
