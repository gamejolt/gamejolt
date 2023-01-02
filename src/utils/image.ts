import { Screen } from '../_common/screen/screen-service';

export const imageMimeTypes = [
	'image/jpg',
	'image/png',
	'image/jpeg',
	'image/bmp',
	'image/gif',
	'image/webp',
];

const WidthHeightRegex = /\/(\d+)x(\d+)\//;
const WidthRegex = /\/(\d+)\//;

export function isImage(file: File) {
	const type = file.type.slice(file.type.lastIndexOf('/') + 1);
	return imageMimeTypes.indexOf('image/' + type) !== -1;
}

export function getImgDimensions(file: File): Promise<[number, number]> {
	return new Promise(resolve => {
		const img = document.createElement('img');
		img.src = URL.createObjectURL(file);
		img.onload = function (this: HTMLImageElement) {
			resolve([this.width, this.height]);
			URL.revokeObjectURL(this.src);
		};
	});
}

/**
 * Creates a file object from an image data url.
 * A data url starts with `data:image/<mime>;`
 */
export function makeFileFromDataUrl(dataUrl: string, fileName: string) {
	let arr = dataUrl.split(','),
		mime = arr[0].match(/:(.*?);/)![1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], fileName, { type: mime });
}

/**
 * Base64 data of a 1x1 pixel transparent gif.
 */
export const emptyGif =
	'data:image/gif;base64,R0lGODlhAQABAIABAAAAAP///yH+EUNyZWF0ZWQgd2l0aCBHSU1QACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export function getMediaserverUrlForBounds({
	src,
	maxWidth,
	maxHeight,
}: {
	src: string;
	maxWidth: number;
	maxHeight: number;
}) {
	// Update width in the URL. We keep width within 100px increment bounds.
	let newSrc = src;
	let largerDimension = Math.max(maxWidth, maxHeight);

	if (Screen.isHiDpi) {
		// For high dpi, double the width.
		largerDimension = largerDimension * 2;
		largerDimension = Math.ceil(largerDimension / 100) * 100;
	} else {
		largerDimension = Math.ceil(largerDimension / 100) * 100;
	}

	if (newSrc.search(WidthHeightRegex) !== -1) {
		newSrc = newSrc.replace(WidthHeightRegex, '/' + largerDimension + 'x2000/');
	} else {
		newSrc = newSrc.replace(WidthRegex, '/' + largerDimension + '/');
	}
	return newSrc;
}
