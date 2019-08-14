import { validateFiles } from './_files';

export function FormValidatorFilesize(files: File | File[], args: [number]) {
	const maxFilesize = args[0];
	return validateFiles(files, file => file.size > 0 && file.size <= maxFilesize);
}
