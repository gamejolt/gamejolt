export const imageMimeTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/bmp', 'image/gif'];

export function isImage(file: File) {
	const type = file.type.slice(file.type.lastIndexOf('/') + 1);
	return imageMimeTypes.indexOf('image/' + type) !== -1;
}

export function getImgDimensions(file: File): Promise<[number, number]> {
	return new Promise(resolve => {
		const img = document.createElement('img');
		img.src = URL.createObjectURL(file);
		img.onload = function(this: HTMLImageElement) {
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
