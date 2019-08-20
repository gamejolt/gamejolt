import { validateFiles } from './_files';

export function FormValidatorAccept(files: File | File[], args: [string]) {
	const acceptTypes = args[0].split(',');
	return validateFiles(files, file => {
		const pieces = file.name.toLowerCase().split('.');

		if (pieces.length < 2) {
			return false;
		}

		const ext = '.' + pieces.pop();
		if (ext && acceptTypes.indexOf(ext) === -1) {
			return false;
		}

		return true;
	});
}
