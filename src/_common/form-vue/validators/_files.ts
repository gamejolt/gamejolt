export function validateFiles(files: File | File[] | null, cb: (file: File) => boolean) {
	if (!files) {
		return true;
	}

	files = Array.isArray(files) ? files : [files];

	for (const file of files) {
		if (!cb(file)) {
			return false;
		}
	}

	return true;
}

export async function validateFilesAsync(
	files: File | File[] | null,
	cb: (file: File) => Promise<boolean>
) {
	if (!files) {
		return true;
	}

	files = Array.isArray(files) ? files : [files];

	for (const file of files) {
		if (!await cb(file)) {
			return { valid: false };
		}
	}

	return { valid: true };
}
