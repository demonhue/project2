const recast = require("recast");

exports.parser = function parser(input) {
    let ast = recast.parse(input, {
        parser: require('recast/parsers/babel-ts')
    });
    return ast;
};

exports.generator = (ast)  => recast.print(ast);