const ts = require('typescript');
const fs = require('fs');

const checkClass = function(summary) {
	return function(node) {
		if (node.kind === ts.SyntaxKind.ClassDeclaration) {
			summary.class = node.name.escapedText;
			ts.forEachChild(node, checkConstructor(summary));
			ts.forEachChild(node, checkProperty(summary));
			ts.forEachChild(node, checkMethods(summary));
		}
	};
};

const checkConstructor = function(summary) {
	return function(node) {
		if (node.kind === ts.SyntaxKind.Constructor) {
			checkParameters(node.parameters, summary);
			ts.forEachChild(node.body, checkCallExpression(summary));
		}
	};
};

const checkProperty = function(summary) {
	return function(node) {
		if (node.kind === ts.SyntaxKind.PropertyDeclaration) {
			if (node.name.escapedText === 'trPrefix') {
				// assuming StringLiteral
				summary.prefix = node.initializer.text;
			}
			// check if properties doesn't have CallExpression
			ts.forEachChild(node.initializer, checkCallExpression(summary));
		}
	};
};

const checkMethods = function(summary) {
	return function(node) {
		if (node.kind === ts.SyntaxKind.MethodDeclaration) {
			ts.forEachChild(node, checkCallExpression(summary));
		}
	};
};

const checkParameters = function(parameters, summary) {
	for (let parameter of parameters) {
		if (parameter.type && parameter.type.typeName.escapedText === 'TranslationService') {
			summary.service = parameter.name.escapedText;
			break;
		}
	}
};

const checkCallExpression = function(summary) {
	return function(node) {
		if (node.kind !== ts.SyntaxKind.CallExpression) {
			ts.forEachChild(node, checkCallExpression(summary));
			return;
		}

		if (
			node.expression.name.escapedText === 'getStatic' &&
			node.expression.expression.name.escapedText == summary.service
		) {
			const args = {
				prefix: '',
				default: '--- NO DEFAULT ---'
			};

			// prefix
			args.prefix = getArgument(node.arguments[0], summary);
			if (node.arguments.length > 1) {
                // default
				args.default = getArgument(node.arguments[1], summary);
			}

			summary.calls.push(args);
		}
	};
};

const getArgument = function(node, summary) {
	if (node.kind === ts.SyntaxKind.StringLiteral) {
		return node.text;
	}
	if (node.kind === ts.SyntaxKind.BinaryExpression) {
		if (node.left.name.escapedText == 'trPrefix') {
			return summary.prefix + node.right.text; // assuming StringLiteral
		}
	}
};

const check = function(source) {
	summary = {
		class: '',
		prefix: '',
		service: '',
		calls: []
	};
	ts.forEachChild(source, checkClass(summary));
	console.log('Summary');
	console.log(summary);
};

try {
	const filename = './examples/test1.ts';
	const sourceFile = ts.createSourceFile(
		filename,
		fs.readFileSync(filename, 'utf8'),
		ts.ScriptTarget.ES2015,
		/*setParentNodes */ true
	);

	check(sourceFile);
} catch (err) {
	console.error(err);
}
