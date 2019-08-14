import { validateFilesAsync } from './_files';
import { getImgDimensions } from '../../../utils/image';

export async function FormValidatorMinImgDimensions(files: File | File[], args: [number, number]) {
	const width = args[0];
	const height = args[1];
	return validateFilesAsync(files, async file => {
		const dimensions = await getImgDimensions(file);
		return (!width || dimensions[0] >= width) && (!height || dimensions[1] >= height);
	});
}
