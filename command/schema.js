function isObject(schema) {
  return schema.type === "object";
}

function isArray(schema) {
  return schema.type === "array";
}

function isReferenceObject(item) {
  const arr = Object.keys(item);
  return arr.includes("$ref") | arr.includes("originalRef");
}

function isCircle(parent, child) {
  return parent === child;
}

function isDefaultType(schema) {
  return ["integer", "string", "number", "boolean"].includes(schema.type);
}

function isNumber(type) {
  return ["integer", "number"].includes(type);
}

function isBoolean(type) {
  return ["boolean"].includes(type);
}


class Schema {
  constructor(schema, defaultAttributes){
    this.schema = schema;
    this.defaultAttributes = defaultAttributes
  }

  parsingSchema(content) {
    let res = {};
    Object.keys(content.definitions).forEach((schema) => {
      if (schema !== '接口返回对象«List«SysPermissionTree»»') {
        let schema_mock = this.handleSchema(
          content.definitions[schema],
          content,
          schema,
          schema,
        );
        res[schema] = schema_mock;
      }
    });
    return res;
  }

  findSchema(schema, refs) {
    const deps = refs.replace(/\#/, "").split("/");
    if (deps.length === 1) {
      deps.unshift("definitions");
    }
    let finalObj = schema;
    deps.forEach((item) => {
      finalObj = finalObj[item] || '';
    });
    return finalObj;
  }

  handleSchema(obj, schema, key, parent) {
    if (isObject(obj)) {
      return this.parseObject(obj, schema, parent);
    }
    if (isArray(obj)) {
      return this.parseArray(obj, schema, key, parent);
    }
    if (isDefaultType(obj)) {
      return this.parseDefault(obj, key);
    }
  }

  parseObject(obj = {}, schema, parent) {
    let res = {};
    Object.keys(obj.properties || {}).forEach((key) => {
      const item = obj.properties[key];
      if (isReferenceObject(item)) {
        if (isCircle(parent, item.$ref || item.originalRef)) {
          res[key] = {};
          return;
        }
        const referenceObj = this.findSchema(schema, item.$ref || item.originalRef);
        const parsedObj = this.handleSchema(referenceObj, schema, key, parent);
        res[key] = parsedObj;
      }
      res[key] = this.handleSchema(item, schema, key, parent);
    });
    return res;
  }

  parseArray(obj, schema, key, parent) {
    if (isReferenceObject(obj.items)) {
      if (isCircle(parent, obj.items.$ref || obj.items.originalRef)) {
        return [];
      }
      const referenceObj = this.findSchema(
        schema,
        obj.items.$ref || obj.items.originalRef
      );
      const parsedObj = this.handleSchema(referenceObj, schema, key, parent);
      return [parsedObj];
    }
    return "default array";
  } 

  parseDefault(obj, key) {
    const { type } = obj;
    if (Object.keys(this.defaultAttributes).includes(key)) {
      return this.defaultAttributes[key];
    }
    if (isNumber(type)) {
      return "@integer(60, 100)";
    }
    if(isBoolean(type)) {
      return true;
    }
    return "@string";
  }
}

module.exports = {
  // parsingSchema,
  Schema
}