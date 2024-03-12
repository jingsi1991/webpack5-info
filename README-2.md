# 进阶部分（优化）
- 构建速度优化
- 构建结果优化

# 构建速度优化
## 费时分析：speed-measure-webpack-plugin 和 mini-css-extract-plugin有兼容性问题，推荐使用 --profie参数
```
// 安装依赖
npm install -D speed-measure-webpack-plugin
```
```
// 使用
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
const Smp = new SpeedMeasurePlugin()


Smp.wrap(config)

```

## 优化resolve配置
- alias：路径别名
```
const path = require('path')
const resolve = (dir)=> path.join(__dirname,dir)

resolve:{
  alias:{
    '@': resolve('src'),
    'components': resolve('src/components'),
  }
}
```

- extensions：默认后缀
```
resolve:{
  extensions: ['.js','.json']
}
```

- modules：告诉webpack解析模块时应该搜索的目录
```
resolve:{
  modules: [resolve('src'), resolve('node_modules')]
}
```
- resolveLoader：告诉webpack从哪里解析loader

## externals：提供【从输出的bundle中排除的依赖】，通常对于library开发者来说最有用。例如从cdn引入jQuery
```
// 1、引入链接
<script
  src="https://code.jquery.com/jquery-3.1.0.js"
  integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk="
  crossorigin="anonymous"
></script>


// 2.配置
module.exports = {
  //...
  externals: {
    jquery: 'jQuery',
  },
};

// 3.使用
import $ from 'jquery';

$('.my-element').animate(/* ... */);


```

## 缩小范围
在loader配置中可以使用 include 和 exclude 来缩小范围，其中exclude优先级高
- include：符合条件的模块进行解析
- exclude：排除符合条件的模块，不解析
```
{
  test: /\.js$/i,
  include: resolve('src'),
  exclude: /node_modules/,
  use: [
    'babel-loader',
  ]
},
```

## module.noParse：不需要解析依赖的第三方大型类库
```
module: { 
  noParse: /jquery|lodash/,
  rules:[...]
}
```

## 多进程配置
注意：实际上在小型项目中，开启多进程打包反而会增加时间成本，因为启动进程和进程间通信都会有一定开销。
happypack在webpack5已经废弃

### thread-loader
配置在thread-loader之后的loader都会在一个单独的worker池中运行
```
// 安装
npm install -D thread-loader

// 配置
module: { 
  rules: [
    {
      test: /\.js$/i,
      include: resolve('src'),
      exclude: /node_modules/,
      use: [
        {
          loader: 'thread-loader', // 开启多进程打包
          options: {
            worker: 3,
          }
        },
        'babel-loader',
      ]
    },
    // ...
  ]
}
```


## 相关的缓存
### babel-loader开启缓存
```
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true // 启用缓存
  }
}
```

### cache-loader
- 缓存一些开销比较大的loader处理
- 缓存位置：node_modules/.cache/cache-loader
```
// 安装
npm install -D cache-loader

// 配置
// 在其他loader前配置
```

### hard-source-webpack-plugin
为模块提供中间缓存，webpack5已经内置了模块缓存，不再使用

### dll
webpack5.x已经不推荐使用了


### cache持久化
通过配置 cache 缓存生成的 webpack 模块和 chunk，来改善构建速度
```
const config = {
  cache: {
    type: 'filesystem',
  },
};
```

# 构建结果优化
## 结果分析
安装
```
npm install -D webpack-bundle-analyzer
```
配置
```
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const config = {
  // ...
  plugins:[ 
    // ...
    // 配置插件 
    new BundleAnalyzerPlugin({
      // analyzerMode: 'disabled',  // 不启动展示打包报告的http服务器
      // generateStatsFile: true, // 是否生成stats.json文件
    })
  ],
};
```

添加构建命令
```
 "scripts": {
    // ...
    "analyzer": "cross-env NODE_ENV=prod webpack --progress --mode production"
  },

```

## 压缩css:css-minimizer-webpack-plugin
```
npm install -D css-minimizer-webpack-plugin
```
```
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

optimization:{
    minimizer:['...',new CssMinimizerPlugin()]
  },
```

## 压缩JS:terser-webpack-plugin
```
// webpack5已经内置了terser-webpack-plugin插件
```

## 清除无用的css：purgecss-webpack-plugin
```
npm install -D purgecss-webpack-plugin
```
```
const {PurgeCSSPlugin} = require("purgecss-webpack-plugin")
const glob = require('glob')

const PATHS = {
  src: resolve('src')
}

plugins:[ // 配置插件
    // ...
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, {nodir: true})
    }),
  ]
```


# 运行时优化
