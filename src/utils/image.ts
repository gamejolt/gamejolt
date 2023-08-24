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

function getMaxMediaserverDimension(maxDimension: number) {
	// Keep mediaserver dimensions within 100px increment bounds.
	const step = 100;

	let dimension = maxDimension;
	if (Screen.isHiDpi) {
		// For high dpi, double the dimension/density.
		dimension = dimension * 2;
	}

	// Round up to the next step.
	dimension = Math.ceil(dimension / step) * step;

	// Make sure our dimension is at least one step.
	if (dimension < step) {
		return step;
	}
	return dimension;
}

/**
 * Updates width/height in a mediaserver url to match the given bounds.
 *
 * NOTE: {@link maxHeight} is ignored unless {@link src} already contains some
 * height definition. {@link maxWidth} is always used.
 *
 */
export function getMediaserverUrlForBounds({
	src,
	maxWidth,
	maxHeight,
}: {
	src: string;
	maxWidth: number;
	maxHeight: number;
}) {
	let newSrc = src;
	const width = getMaxMediaserverDimension(maxWidth);

	if (newSrc.search(WidthHeightRegex) !== -1) {
		const height = getMaxMediaserverDimension(maxHeight);
		newSrc = newSrc.replace(WidthHeightRegex, `/${width}x${height}/`);
	} else {
		newSrc = newSrc.replace(WidthRegex, `/${width}/`);
	}
	return newSrc;
}
