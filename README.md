# webpack5-info
- webpack默认支持处理JS和JSON文件，其他类型都无法直接处理，需要借助loader来进行处理

# 初体验-简单配置
## 初始化项目
```
npm init -y
git init
```
## 安装webpack
```
npm install -D webpack webpack-cli
```

## 初次构建
```
// 方案1：webpack 4+后可以无配置运行
npx webpack
```

```
// 方案2：添加配置文件
// webpack.config.js
const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, 'bundle'),
  },
};

// package.json添加运行命令
  "scripts": {
    "build": "webpack",
    "test": "echo \"Error: no test specified\" && exit 1"
  },

// 构建
npm run build

```

# SourceMap配置
## 配置devtool
```
devtool: 'source-map'
```
执行打包后，目录下会生成 .map 结尾的 SourceMap文件

## SourceMap的其他类型
- source-map
  - 生成文件，打包速度慢，能定位到行列
- eval
- eval-source-map
- cheap-source-map
- inline-source-map
- cheap-module-source-map
- inline-cheap-source-map
- cheap-module-eval-source-map
- inline-cheap-module-source-map
- hidden-source-map
- nosources-source-map
说明
- inline：代码内通过 dataUrl 形式引入 SourceMap
- hidden：生成 SourceMap 文件，但不使用
- eval：eval(...) 形式执行代码，通过 dataUrl 形式引入 SourceMap
- nosources：不生成 SourceMap
- cheap：只需要定位到行信息，不需要列信息
- module：展示源代码中的错误位置

本地推荐：eval-cheap-module-source-map
生产推荐：none

# 三种hash
- hash：每次构建都生成唯一的hash值
- chunkhash：根据chunk生成hash值
- contenthash：根据文件内容生成hash值

# Loader
## 处理css相关
- postcss-loader/postcss/postcss-preset-env：css的兼容性
- css-loader：处理css文件，把css文件转换成js部分
- style-loader：把css处理完成的js部分插入到html中个，核心逻辑如下
```
const content = `${样式内容}`
const style = document.createElement('style');
style.innerHTML = content;
document.head.appendChild(style);
```

## 处理图片及字体文件
- file-loader：解决图片引入问题，将图片copy到指定目录，默认为dist
- url-loader：基于file-loader，当图片小于limit时，将图片转为base64编码，大于时依然使用file-loader拷贝
- img-loader：压缩图片

### 使用webpack5之前的方式
```
// 使用webpack5之前的方式
// 注意esModule 和 type的配置，
{
  test: /\.(jpe?g|png|gif)$/i, // 匹配图片文件
  use: [
    {
      loader: "url-loader", // 使用 url-loader
      options: {
        name: "images/[name][contenthash:8].[ext]",
        limit: 50 * 1024, // 当使用url-loader是可以用
        esModule: false // 关闭url-loader的es6语法模块法解析，使用commonjs
      },
    },
  ],
  type: 'javascript/auto' // 转换 json 为 js
},
```

### 使用webpack5中的：asset module处理
```
// 使用webpack5中的：asset module处理
// asset/inline 将资源导出为 dataUrl 的形式，类似之前的 url-loader 的小于 limit 参数时功能.
// asset/resource 将资源分割为单独的文件，并导出 url，类似之前的 file-loader 的功能.
// asset/source 将资源导出为源码（source code）. 类似的 raw-loader 功能.
// asset 会根据文件大小来选择使用哪种类型，当文件小于 8 KB（默认） 的时候会使用 asset/inline，否则会使用 asset/resource
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
},
```


## JS兼容性处理（babel）
### 安装依赖
- babel-loader 使用 Babel 加载 ES2015+ 代码并将其转换为 ES5
- @babel/core Babel 编译的核心包
- @babel/preset-env Babel 编译的预设，可以理解为 Babel 插件的超集
```
npm install -D babel-loader @babel/core @babel/preset-env
```
### 配置loader
```
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
```

### 独立的配置文件（.babelrc.js）
```
// ./babelrc.js

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        // useBuiltIns: false 默认值，无视浏览器兼容配置，引入所有 polyfill
        // useBuiltIns: entry 根据配置的浏览器兼容，引入浏览器不兼容的 polyfill
        // useBuiltIns: usage 会根据配置的浏览器兼容，以及你代码中用到的 API 来进行 polyfill，实现了按需添加
        useBuiltIns: "entry",
        corejs: "3.9.1", // 是 core-js 版本号
        targets: {
          chrome: "58",
          ie: "11",
        },
      },
    ],
  ],
};

```

### 常见babel预设
- @babel/preset-flow
- @babel/preset-react
- @babel/preset-typescript




# plugin
- html-webpack-plugin：将打包后的资源文件自动引入到html中
- clean-webpack-plugin：自动清空打包目录（webpack5.20+可以使用output.clean）
- mini-css-extract-plugin：分离样式文件, link引入 和 style-loader不同



- webpack-dev-server: 本地开发服务