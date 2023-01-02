const fs = require('fs');
const vm = require('vm');
const NativeModule = require('module');

// A lot of this code is taken from
// https://github.com/vuejs/vue/blob/063acb79ebc02344ab277196d4aea0577b113926/src/server/bundle-renderer/create-bundle-runner.js

function createSandbox(context) {
	const sandbox = {
		console,
		setTimeout,
		setInterval,
		setImmediate,
		clearTimeout,
		clearInterval,
		clearImmediate,
	};
	sandbox.global = sandbox;
	return sandbox;
}

module.exports.compileModule = filepath => {
	// We have to wrap the code in the nodejs module wrapper function like it
	// would normally do if we called require().
	// https://nodejs.org/api/modules.html#the-module-wrapper
	const codeString = fs.readFileSync(filepath, 'utf-8');
	const wrapper = NativeModule.wrap(codeString);
	const script = new vm.Script(wrapper, {
		filename: filepath,
		displayErrors: true,
	});

	return (context = {}) => {
		const compiledWrapper = script.runInNewContext(createSandbox(context));

		const m = { exports: {} };

		// The module wrapper will wrap the function with this signature:
		// (function(exports, require, module, __filename, __dirname) {
		//
		// So we call the function, passin the exports as the "this" object,
		// then pass in the appropriate other stuff.
		compiledWrapper.call(m.exports, m.exports, require, m);

		const res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
			? m.exports.default
			: m.exports;

		return res;
	};
};
