const fs = require('fs');
const vm = require('vm');
const NativeModule = require('module');

// module.exports.getPreparedScript = filepath => {
// 	const codeString = fs.readFileSync(filepath, 'utf-8');
// 	const script = new vm2.VMScript(codeString);
// 	script.compile();

// 	return script;
// };

// module.exports.getNewContext = (context = {}) =>
// 	new vm2.NodeVM({
// 		sandbox: context,

// 		require: {
// 			external: true,
// 			builtin: ['*'],
// 			context: 'sandbox',
// 		},

// 		env: {
// 			...process.env,

// 			// Axios uses follow-redirects which uses debug which attempts to detect
// 			// if the process is running from a tty by inspecting process.stdout.fd and process.stderr.fd.
// 			// The VM unsets these which causes: Cannot read property 'fd' of undefined
// 			DEBUG_COLORS: 'false',
// 		},
// 	});

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
		const compiledWrapper = script.runInNewContext(context);

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
