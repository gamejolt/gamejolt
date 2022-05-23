import { parseAndInferOptionsFromCommandline } from './vite-options';
import { runVite } from './vite-runner';

const minimist = require('minimist');

(async () => {
	const args = minimist(process.argv.splice(2));

	let command;
	if (args._.length === 0) {
		command = 'serve';
	} else if (args._.length === 1) {
		switch (args._[0]) {
			case 'dev':
			case 'serve':
				command = 'serve';
				break;

			case 'build':
				command = 'build';
				break;

			default:
				throw new Error('Invalid command');
		}
	} else {
		throw new Error('Invalid command');
	}

	const gjOpts = await parseAndInferOptionsFromCommandline(args);
	console.log(gjOpts);
	runVite({ command }, gjOpts);
})();
