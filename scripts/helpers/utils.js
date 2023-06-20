const recast = require("recast");

exports.parser = function parser(input) {
    let ast = recast.parse(input, {
        parser: require('recast/parsers/babel-ts')
    });
    return ast;
};

class importedVariable {
    constructor({type,importedName,from,localName}){
        this.type = type;
        this.importedName = importedName;
        this.from = from;
        this.localName = localName;
    }

    hash(){//this string will uniquely identify each import
        return JSON.stringify({from: this.from, localName: this.localName});
    }
};

class exportedVariable {
    constructor({type,importedName,from,localName,source}){
        this.type = type;
        this.importedName = importedName;
        this.from = from;
        this.localName = localName;
        this.source = source;
    }

    hash(){
        return this.from + "+" + this.localName;//this string will uniquely identify each import
    }
};

exports.generator = (ast)  => recast.print(ast);