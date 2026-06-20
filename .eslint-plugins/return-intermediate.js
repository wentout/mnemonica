'use strict';

/**
 * ESLint rule: mnemonica/return-intermediate
 *
 * Enforces that every return statement uses an intermediate variable
 * for non-trivial expressions. This is critical for debuggability with
 * Chrome Dev Tools — when execution pauses on `return result`, you can
 * hover over `result` and inspect the value.
 *
 * Allowed: return x; return 42; return null; return true; return this;
 * Forbidden: return new Foo(); return fn(); return { a: 1 };
 */

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Every return expression must go through an intermediate variable/constant',
			category: 'Best Practices',
			recommended: true,
		},
		schema: [],
		messages: {
			returnIntermediate:
				'Use an intermediate variable before returning. ' +
				'Assign the expression to a const, then return the const. ' +
				'Example: const result = {{expr}}; return result;',
		},
	},

	create (context) {
		return {
			ReturnStatement (node) {
				const argument = node.argument;

				// Bare return — fine
				if (!argument) {
					return;
				}

				// Allowed without intermediate:
				// - Identifier: return x;
				// - Literal: return 42; return 'hello'; return null;
				// - ThisExpression: return this;
				// - MemberExpression: return obj.prop; return self.inheritedInstance;
				if (
					argument.type === 'Identifier' ||
					argument.type === 'Literal' ||
					argument.type === 'ThisExpression' ||
					argument.type === 'MemberExpression'
				) {
					return;
				}

				// Everything else must go through an intermediate variable
				const sourceCode = context.getSourceCode();
				const exprText = sourceCode.getText(argument);

				context.report({
					node,
					messageId: 'returnIntermediate',
					data: {
						expr: exprText,
					},
				});
			},
		};
	},
};

module.exports = rule;
