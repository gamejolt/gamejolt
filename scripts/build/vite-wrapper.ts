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

	const viteProcess = runVite({ command, watch: args.watch ?? false }, gjOpts);

	await new Promise<void>((resolve, reject) => {
		viteProcess.on('exit', code => {
			process.exitCode = code ?? -1;

			if (code === 0) {
				return resolve();
			}

			reject(`Vite ended with exit code ${code}`);
		});
	});
})();
