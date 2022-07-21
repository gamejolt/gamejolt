import assetFireplace from './sheets/fireplace.png';

export class ImgSlideshow {
	constructor(
		public readonly asset: string,
		public readonly assetWidth: number,
		public readonly assetHeight: number,
		public readonly frames: number,
		public readonly fps: number
	) {}

	get frameAspectRatio() {
		return this.assetWidth / this.frames / this.assetHeight;
	}
}

export const sheetFireplace = new ImgSlideshow(assetFireplace, 2000, 500, 4, 8);
