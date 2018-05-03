const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const glob = require('glob')

const path = require('path')

var ENTRY_PATH = path.resolve(__dirname, './src')

var entryFiles = glob.sync(ENTRY_PATH + '/*.js')
console.log(entryFiles)

var map = {}

entryFiles.forEach((filePath) => {
  // 取入口文件的名字
  var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
  map[filename] = filePath
})

module.exports = {
  entry: map, // 入口文件

  output: {
    filename: '[name].js',      // 打包后的文件名称
    path: path.resolve('dist')  // 打包后的目录，必须是绝对路径
  },

  mode: 'development',

  devServer: {
    contentBase: './dist',
    host: 'localhost',      // 默认是localhost
    port: 3000,             // 端口
    open: true,             // 自动打开浏览器
    hot: true               // 开启热更新
  },

  resolve: {
    // 别名
    alias: {
      '@': './src/'
    },
    // 省略后缀
    extensions: ['.js', '.json', '.css']
  },
  // 提取公共代码
   optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {   // 抽离第三方插件
          test: /node_modules/,   // 指定是node_modules下的第三方包
          chunks: 'initial',
          name: 'vendor',  // 打包后的文件名，任意命名
          // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
          priority: 10
        }
      }
    }
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['vendor', 'index']   // 对应关系,index.js对应的是index.html
    }),


    new HtmlWebpackPlugin({
      template: './main.html',
      filename: 'main.html',
      chunks: ['vendor', 'main']   // 对应关系,main.main.html
    }),
    // 拆分后会把css文件放到dist目录下的css/*.css
    new ExtractTextWebpackPlugin('css/[name].css'),

    new webpack.HotModuleReplacementPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: /src/,          // 只转化src目录下的js
        exclude: /node_modules/  // 排除掉node_modules，优化打包速度
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [
            {
                loader: 'url-loader',
                options: {
                    limit: 8192,    // 小于8k的图片自动转成base64格式，并且不会存在实体图片
                    outputPath: 'images/'   // 图片打包后存放的目录
                }
            }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextWebpackPlugin.extract({
          // 将css用link的方式引入就不再需要style-loader了
          use: ['css-loader', 'postcss-loader'],
          publicPath: '../' //针对设置背景图
        })
      },
      {
        // 针对页面直接引入图片
        test: /\.(htm|html)$/,
        use: 'html-withimg-loader'
      },
      {
        // 字体图标和svg图片
        test: /\.(eot|ttf|woff|svg)$/,
        use: 'file-loader'
      }
    ]
  }
}