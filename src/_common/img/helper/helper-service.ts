export class ImgHelper {
	static loaded(url: string) {
		return new Promise((resolve, reject) => {
			const img: HTMLImageElement = window.document.createElement('img');
			img.onload = resolve;
			img.onerror = reject;
			img.src = url;
		});
	}

	static getResizedDimensions(
		originalWidth: number,
		originalHeight: number,
		maxWidth?: number,
		maxHeight?: number
	) {
		const aspectRatio = originalHeight / originalWidth;
		let width: number, height: number;

		// Setting max for both.
		if (maxWidth && maxHeight) {
			width = Math.min(originalWidth, maxWidth);
			height = width * aspectRatio;

			if (height > maxHeight) {
				height = maxHeight;
				width = height / aspectRatio;
			}
		} else if (maxWidth && !maxHeight) {
			width = Math.min(originalWidth, maxWidth);
			height = width * aspectRatio;
		} else if (!maxWidth && maxHeight) {
			height = Math.min(originalHeight, maxHeight);
			width = height / aspectRatio;
		} else {
			throw new Error('Invalid params.');
		}

		return {
			width,
			height,
		};
	}
}
