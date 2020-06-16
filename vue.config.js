const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const path = require('path')

// Generate pages object
const pagesObj = {}
const chromeName = ['devtools-panel']

chromeName.forEach(name => {
  pagesObj[name] = {
    entry: `src/${name}/index.js`,
    template: 'public/index.html',
    filename: `${name}.html`
  }
})

// 生成manifest文件
const manifest =
  process.env.NODE_ENV === 'production' ? {
    from: path.resolve('src/manifest.production.json'),
    to: `${path.resolve('dist')}/manifest.json`
  } : {
    from: path.resolve('src/manifest.development.json'),
    to: `${path.resolve('dist')}/manifest.json`
  }

const plugins = [
  new HtmlWebpackPlugin({
    // chunks: ['devtools-panel-loader'],
    chunks: [],
    filename: 'devtools-panel-loader.html',
    template: 'src/devtools-panel-loader/index.html'
  }),
  // devtools-panel-loader
  CopyWebpackPlugin([{
    from: path.resolve('src/devtools-panel-loader/index.js'),
    to: path.resolve('dist/js/devtools-panel-loader.js')
  }]),
  CopyWebpackPlugin([{
    from: path.resolve('node_modules/webextension-polyfill/dist/browser-polyfill.min.js'),
    to: path.resolve('dist/browser-polyfill.js')
  }]),
  CopyWebpackPlugin([{
    from: path.resolve('misc/icons/*.png'),
    to: path.resolve('dist/img/icons/'),
    flatten: true
  }]),
  CopyWebpackPlugin([manifest])
]

// 开发环境将热加载文件复制到dist文件夹
if (process.env.NODE_ENV !== 'production') {
  plugins.push(
    CopyWebpackPlugin([{
      from: path.resolve('src/utils/hot-reload.js'),
      to: path.resolve('dist')
    }])
  )
}

// 生产环境打包dist为zip
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new ZipPlugin({
      path: path.resolve('dist'),
      filename: 'dist.zip'
    })
  )
}

module.exports = {
  pages: pagesObj,

  // // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,

  configureWebpack: {
    entry: {
      'content': './src/content/index.js',
      'background': './src/background/index.js'
    },
    output: {
      filename: 'js/[name].js'
    },
    plugins: plugins
  },

  css: {
    extract: {
      filename: 'css/[name].css'
      // chunkFilename: 'css/[name].css'
    }
  },

  chainWebpack: config => {
    // 处理字体文件名，去除hash值
    const fontsRule = config.module.rule('fonts')

    // 清除已有的所有 loader。
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    fontsRule.uses.clear()
    fontsRule.test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
      .use('url')
      .loader('url-loader')
      .options({
        limit: 1000,
        name: 'fonts/[name].[ext]'
      })

    // 查看打包组件大小情况
    if (process.env.npm_config_report) {
      config
        .plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
