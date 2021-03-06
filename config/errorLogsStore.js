module.exports = {
    errorLogs: {
        type: "directory",
        label: "Лог ошибок",
        navOrder: 1024,
        navGroup: "config",
        display: "list, table",
        orderBy: "-_id",
        access: [
            {
                role: "root",
                permissions: "vr",
            },
        ],
        tableColumns: [
            { prop: "store", tableLink: true },
            { prop: "action", tableLink: true },
            "userId",
            "createdAt",
            { prop: "errorText", orderBy: "error" },
        ],
        labels: [
            {
                text: 'Дата: {{moment $item.createdAt format="DD.MM.YYYY HH:mm:ss"}}',
                showInList: 1,
            },
        ],
        filters: {
            userId: {
                type: "ref",
                display: "searchBox",
                store: "users",
                searchBy: ["login", "name"],
                label: "Пользователь",
                formOrder: 10,
                query: {
                    userId: "$value",
                },
            },
        },
        props: {
            _id: {
                type: "int",
            },
            name: {
                type: "string",
                disabled: true,
            },
            store: {
                type: "string",
                display: "textInput",
                label: "Стора",
                formOrder: 10,
            },
            action: {
                type: "string",
                display: "textInput",
                label: "Действие",
                formOrder: 20,
                options: [
                    { value: "action", label: "Action" },
                    { value: "update", label: "Update" },
                    { value: "insert", label: "Insert" },
                    { value: "delete", label: "Delete" },
                    { value: "$db.update", label: "DB update" },
                    { value: "$db.insert", label: "DB insert" },
                    { value: "$db.delete", label: "DB delete" },
                    { value: "$db.find", label: "DB find" },
                    { value: "$db.get", label: "DB get" },
                    { value: "$db.newId", label: "DB newId" },
                    { value: "$db.count", label: "DB count" },
                    { value: "$db.nextSequence", label: "DB nextSequence" },
                    { value: "$db.nextSequenceString", label: "DB nextSequenceString" },
                    { value: "$db.notify", label: "DB notify" },
                    { value: "hook", label: "HTTP hook" },
                ],
            },
            userId: {
                type: "ref",
                display: "searchBox",
                store: "users",
                searchBy: ["login", "name"],
                label: "Пользователь",
                formOrder: 30,
            },
            context: {
                type: "string",
                display: "code",
                label: "Контекст",
                tooltip: "Название экшена, айдишник документа и т.п.",
                formOrder: 40,
            },
            error: {
                type: "string",
                display: "code",
                label: "Ошибка",
                formOrder: 50,
            },
            errorText: {
                type: "virtual/client",
                label: "Ошибка",
                display: "none",
                load($item) {
                    return $item.error.slice(0, 64);
                },
            },
            createdAt: {
                type: "date",
                label: "Дата",
            },
        },
        objectLifeCycle: {
            willCreate($item) {
                const { store, action } = $item;
                $item.name = `${store}, ${action}`;
                $item.error = ($item.error || "").replace(
                    /(\\n\s+)/g,
                    `
`
                );
            },
        },
    },
};
