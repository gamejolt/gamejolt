const vm2 = require('vm2');
const fs = require('fs');

module.exports.getPreparedScript = function (filepath) {
	const codeString = fs.readFileSync(filepath, 'utf-8');
	const script = new vm2.VMScript(codeString);
	script.compile();

	return script;
};

module.exports.getNewContext = function (context = {}) {
	return new vm2.NodeVM({
		sandbox: context,

		require: {
			external: true,
			builtin: ['*'],
			context: 'sandbox',
		},

		env: {
			...process.env,

			// Axios uses follow-redirects which uses debug which attempts to detect
			// if the process is running from a tty by inspecting process.stdout.fd and process.stderr.fd.
			// The VM unsets these which causes: Cannot read property 'fd' of undefined
			DEBUG_COLORS: 'false',
		},
	});
};
