

const path = require("path");
const packageDirname = require.main.exports.getPath();
let webAppPath = path.join(packageDirname, "node_modules", "blank-web-app");
const webpack = require(path.resolve(webAppPath, "node_modules", "webpack"));
// const CleanWebpackPlugin = require(path.resolve(webAppPath, "node_modules", "clean-webpack-plugin"));
const app = require(path.resolve(webAppPath, "node_modules", "express"))();
const webpackDevMiddleware = require(path.resolve(webAppPath, "node_modules", "webpack-dev-middleware"));
const webpackHotMiddleware = require(path.resolve(webAppPath, "node_modules","webpack-hot-middleware"));
const HOT_SERVER_URL = "http://localhost:2816/";

module.exports = (configPath) => {
    const APP_DIR = path.resolve(webAppPath, "src");
    console.log("webAppPath", webAppPath);
    console.log("APP_DIR", APP_DIR);

    const config = {
        mode: "development",
        entry: [
            "react-hot-loader/patch",
            `webpack-hot-middleware/client?reload=true&path=${HOT_SERVER_URL}__webpack_hmr`,
            "whatwg-fetch",
            path.resolve(webAppPath, "./src/js/app.js"),
        ],
        devtool: "eval",
        devServer: {
            inline: true,
        },
        output: {
            path: path.resolve(configPath, "dist"),
            filename: "bundle.js",
            chunkFilename: "[name].js",
            publicPath: HOT_SERVER_URL,
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
                    exclude: (m) => {
                        return m.includes("/blank-web-app/node_modules/");
                    },
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                require.resolve("babel-preset-react"),
                                require.resolve("babel-preset-env"),
                                require.resolve("babel-preset-stage-0"),
                            ],
                            comments: true,
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
            new webpack.HotModuleReplacementPlugin(),
            new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|ru)$/),
            new webpack.DefinePlugin({
                REMOTEDIR: configPath ? JSON.stringify(path.resolve(configPath, "lib", "reactComponents")) : JSON.stringify(false),
            }),
        ],
    };

    if (configPath) {
        config.resolve.modules.push(path.resolve(configPath, "node_modules"));
    }
    const compiler = webpack(config);
    // return new Promise((resolve, reject) => {
    //     webpack(config, (err, stats) => {
    //         if (err) {
    //             console.error(err.stack || err);
    //             if (err.details) {
    //                 console.error(err.details);
    //             }
    //             reject();
    //         }

    //         const info = stats.toJson();

    //         if (stats.hasErrors()) {
    //             console.error(Array.isArray(info.errors) ? info.errors.join(" ") : info.errors);
    //         }

    //         if (stats.hasWarnings()) {
    //             console.warn(Array.isArray(info.warnings) ? info.warnings.join(" ") : info.warnings);
    //         }

    //         console.log(info.assets);

    //         resolve();
    //     });
    // })
    //     .then(() => console.info("Finish Webpack Compile"));

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
    }));
    app.use(webpackHotMiddleware(compiler));

    app.listen(2816, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
};