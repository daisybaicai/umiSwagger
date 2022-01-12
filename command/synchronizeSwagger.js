const swaggerParserMock = require('swagger-parser-mock');
const fs = require('fs');
// const mkdirp = require('mkdirp')
const { Schema } = require('./schema.js')

function UpperCase(value) {
  return value.toUpperCase();
}

function parsingObjectsToResponse(content, prefix = '/api') {
  let res = {};
  Object.keys(content.paths).forEach((path) => {
    const methods = content.paths[path];
    Object.keys(methods).forEach((method) => {
      const method_uppercase = UpperCase(method);
      const keyName = `${method_uppercase} ${prefix}${path}`;
      const { responses } = methods[method];
      // 暂时只处理200的情况
      const reponse_200 = responses["200"];
      res[keyName] = reponse_200;
    });
  });
  return res;
}

function combineResponseSchema(responses, schemas, url) {
  let res = {};
  Object.keys(responses).forEach((path) => {
    const key = responses[path].schema.originalRef || responses[path].schema.$$ref.replace(url, "").replace("#/definitions/", "");
    const finalSchema = schemas[key];
    res[path] = finalSchema;
  });
  return res;
}



const synchronizeSwagger = {
  async init({ url, blacklist, outputPath, dataLength, fileName, whitelist, prefix = "/", independentServer, defaultAttributes }) {
    this.url = url;
    this.blacklist = blacklist;
    this.whitelist = whitelist;
    this.outputPath = outputPath;
    this.dataLength = dataLength;
    this.fileName = fileName;
    this.content = '';
    this.prefix = prefix;
    this.independentServer = independentServer;
    this.defaultAttributes = defaultAttributes;
    await this.parse()
    if (this.content) {
      await writeToMockFile(this.outputPath, this.fileName, this.content, this.independentServer)
      return ({ state: 'success', content: this.content })
    } else {
      return ({ state: 'failed' })
    }
  },
  // 解析swagger-api-doc
  async parse() {
    const content = await swaggerParserMock(this.url)
    const responses = parsingObjectsToResponse(content);
    const s = new Schema(content, this.defaultAttributes);
    const schemas = s.parsingSchema(content);
    const composed = combineResponseSchema(responses, schemas, this.url);
    this.content = `${JSON.stringify(composed, "", 2)}`;
  },
};


// 将mock数据写入js文件
function writeToMockFile(outputPath, fileName, content, independentServer) {
  // 写入文件
  let template = !independentServer ?
    `var Mock = require('mockjs')
  export default 
    ${content}
    `
    :
    `const Mock = require('mockjs')
    module.exports = function(app) 
      ${content}
  `;
  fs.writeFile(`${outputPath}/${fileName}`, template, (err, data) => {
    if (!err) {
      console.log("finish write");
    }
  })
}


module.exports = {
  synchronizeSwagger
}
