module.exports = {
  url: 'http://118.31.73.168:11000/bms-api/v2/api-docs?group=backend_V1.0.0',// 默认swagger api地址
  outputPath: './mock', //默认目录
  blacklist: [],  // 黑名单 默认是模块 例如：['report'] 默认不更新report下的所有接口
  dataLength: '1-8', // mock 为数组时数组长度
  fileName: 'mock.js',
  prefix:'/api', //自定义mock前缀，默认为/，若有api可修改为/api
  independentServer: false, // 使用umi时不需要配置该选项，如果是自己独立启用项目需要配置为true
  defaultAttributes: {
    code: 0,
    msg: "success",
    count: 10,
    total: 10,
    pages: 10,
    current: 1,
  }
}
