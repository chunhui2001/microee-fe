$ sudo npm install -g npx
$ sudo npm install -g cnpm
$ sudo npm install -g create-react-app
$ npx create-react-app rock-reack
$ cd rock-reack && npm start 

# yarn run eject
# 1). install port: https://yarnpkg.com/lang/zh-hans/docs/install/#mac-stable
# 2). install yarn: sudo port install yarn
# 3). eject project: yarn run eject

# added babel plugins
"babel": {
  "plugins": [
    "transform-decorators-legacy"
  ],
  "presets": [
    "react-app"
  ]
},

Error: The ‘decorators’ plugin requires a ‘decoratorsBeforeExport’ option, whose value must be a boolean. If you are migrating from Babylon/Babel 6 or want to use the old decorators proposal, you should use the ‘decorators-legacy’ plugin instead of ‘decorators’

npm install -D @babel/plugin-proposal-decorators
配置 package.json 文件的 babel 字段值

 babel: {
	"plugins": [
	    ["@babel/plugin-proposal-decorators", { "legacy": true }],
	 ]
  }


# 启动开发服务器
$ npm run start

# 打包
$ npm run build

# nohash
$ ./non-hash.sh

# publish
$ ./publish.sh


npm install --save styled-components
npm i -S styled-components

