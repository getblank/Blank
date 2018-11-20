const path = require("path");
const blankJson = require("./blankJson");
const packageDirname = require.main.exports.getPath();
let webAppPath = path.join(packageDirname, "node_modules", "blank-web-app");
const { execSync, spawnSync } = require("child_process");

try {
    execSync("node -e 'require.resolve(\"./node_modules/webpack\")'", { stdio: "ignore", cwd: webAppPath });
} catch (error) {
    console.log("======NPM INSTALL IN BLANK-WEB-APP======");
    spawnSync("npm", ["install"], { stdio: "inherit", cwd: webAppPath });
    console.log("======FINISH NPM INSTALL======");
}

module.exports = configPath => {
    const APP_DIR = path.resolve(webAppPath, "src");
    console.log("webAppPath", webAppPath);
    console.log("APP_DIR", APP_DIR);
    const webpack = require(path.resolve(webAppPath, "node_modules", "webpack"));
    const CleanWebpackPlugin = require(path.resolve(webAppPath, "node_modules", "clean-webpack-plugin"));
    const config = {
        mode: "production",
        entry: ["whatwg-fetch", path.resolve(webAppPath, "./src/js/app.js")],
        output: {
            path: path.resolve(configPath, "dist"),
            filename: "bundle.js",
            chunkFilename: "[name].js",
            publicPath: "/assets/blank/js/",
        },
        resolve: {
            modules: [
                path.resolve(APP_DIR, "js"),
                path.resolve(webAppPath, "blank-js-core"),
                path.resolve(webAppPath, "src/lib"),
                path.resolve(webAppPath, "node_modules"),
                "node_modules",
            ],
            alias: {
                constants: path.resolve(webAppPath, "blank-js-core/constants.js"),
            },
        },
        resolveLoader: {
            modules: [path.resolve(webAppPath, "node_modules")],
            extensions: [".js", ".json"],
            mainFields: ["loader", "main"],
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: m => {
                        return m.includes("/blank-web-app/node_modules/");
                    },
                    use: {
                        loader: "babel-loader",

                        options: {
                            presets: [require.resolve("@babel/preset-react"), require.resolve("@babel/preset-env")],
                            comments: true,
                            overrides: [
                                {
                                    sourceType: "unambiguous",
                                },
                            ],
                            plugins: [
                                require.resolve("@babel/plugin-syntax-dynamic-import"),
                                require.resolve("@babel/plugin-syntax-import-meta"),
                                require.resolve("@babel/plugin-proposal-class-properties"),
                                require.resolve("@babel/plugin-proposal-json-strings"),
                                [
                                    require.resolve("@babel/plugin-proposal-decorators"),
                                    {
                                        legacy: true,
                                    },
                                ],
                                require.resolve("@babel/plugin-proposal-function-sent"),
                                require.resolve("@babel/plugin-proposal-export-namespace-from"),
                                require.resolve("@babel/plugin-proposal-numeric-separator"),
                                require.resolve("@babel/plugin-proposal-throw-expressions"),
                                require.resolve("@babel/plugin-proposal-export-default-from"),
                                require.resolve("@babel/plugin-proposal-logical-assignment-operators"),
                                require.resolve("@babel/plugin-proposal-optional-chaining"),
                                [
                                    require.resolve("@babel/plugin-proposal-pipeline-operator"),
                                    {
                                        proposal: "minimal",
                                    },
                                ],
                                require.resolve("@babel/plugin-proposal-nullish-coalescing-operator"),
                                require.resolve("@babel/plugin-proposal-do-expressions"),
                                require.resolve("@babel/plugin-proposal-function-bind"),
                                [
                                    require.resolve("@babel/plugin-transform-runtime"),
                                    {
                                        regenerator: true,
                                    },
                                ],
                            ],
                        },
                    },
                },
            ],
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: ({ userRequest }) => {
                            return userRequest ? userRequest.includes("/blank-web-app/node_modules/") : false;
                        },
                        name: "vendors",
                        chunks: "initial",
                    },
                },
            },
        },
        plugins: [
            new CleanWebpackPlugin(path.resolve(configPath, "dist"), { allowExternal: true }),
            new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|ru)$/),
            new webpack.DefinePlugin({
                REMOTEDIR: configPath
                    ? JSON.stringify(path.resolve(configPath, "lib", "reactComponents"))
                    : JSON.stringify(false),
            }),
        ],
    };

    const settings = blankJson.read(configPath);
    if (
        settings.webpackConfig &&
        typeof settings.webpackConfig === "object" &&
        Object.keys(settings.webpackConfig).length
    ) {
        Object.assign(config, settings.webpackConfig);
    }

    if (configPath) {
        config.resolve.modules.push(path.resolve(configPath, "node_modules"));
    }

    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) {
                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }
                reject();
            }

            const info = stats.toJson();

            if (stats.hasErrors()) {
                console.error(Array.isArray(info.errors) ? info.errors.join(" ") : info.errors);
            }

            if (stats.hasWarnings()) {
                console.warn(Array.isArray(info.warnings) ? info.warnings.join(" ") : info.warnings);
            }

            console.log(info.assets);

            resolve();
        });
    }).then(() => console.info("Finish Webpack Compile"));
};
