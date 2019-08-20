import { validateFilesAsync } from './_files';
import { getImgDimensions } from '../../../utils/image';

export async function FormValidatorMinImgRatio(files: File | File[], args: [number]) {
	const ratio = args[0];
	return validateFilesAsync(files, async file => {
		const dimensions = await getImgDimensions(file);
		return dimensions[0] / dimensions[1] >= ratio;
	});
}
