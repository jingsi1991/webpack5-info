const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

console.log("process.env.NODE_ENV", process.env.NODE_ENV);

const config = {
  // mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "bundle"),
    // clean: true
  },
  devtool:"source-map",
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: [
          {
            loader: 'babel-loader',
            options:{
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      {
        test: /\.css$/,
        // use: ["style-loader", "css-loader", "postcss-loader"], // style-loader：将样式通过 style 标签的形式添加到页面上
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        type: 'asset',
        generator: {
          // 输出文件位置以及文件名
          // [ext] 自带 "." 这个与 url-loader 配置不同
          filename: "images/[name][hash:8][ext]"
        },
        parser: {
          dataUrlCondition: {
            maxSize: 50 * 1024 //超过50kb不转 base64
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: {
          // 输出文件位置以及文件名
          filename: "fonts/[name][hash:8][ext]"
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 超过100kb不转 base64
          }
        }
      }
    ],
  },
  devServer: {
    compress: true, // 是否开启gzip压缩
    port: 4001,
    open: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:8].css",
    }),
  ],
};

module.exports = (env, argv) => {
  console.log("argv.mode=", argv.mode); // 打印 mode(模式) 值
  // 这里可以通过不同的模式修改 config 配置
  return config;
};
