import assetChargeOrb from './sheets/charge-orb.png';
import assetFireplace from './sheets/fireplace.png';
import assetShockRectBL from './sheets/shock-rect-bl.png';
import assetShockRectTR from './sheets/shock-rect-tr.png';
import assetShockSquare from './sheets/shock-square.png';

interface ImgSlideshowOptions {
	readonly asset: string;
	readonly assetWidth: number;
	readonly assetHeight: number;
	readonly frames: number;
	readonly fps: number;
}

export class ImgSlideshow {
	constructor(private readonly _options: ImgSlideshowOptions) {}

	get asset() {
		return this._options.asset;
	}

	get frames() {
		return this._options.frames;
	}

	get fps() {
		return this._options.fps;
	}

	get frameAspectRatio() {
		const { assetWidth, frames, assetHeight } = this._options;
		return assetWidth / frames / assetHeight;
	}
}

export const sheetFireplace = new ImgSlideshow({
	asset: assetFireplace,
	assetWidth: 2000,
	assetHeight: 500,
	frames: 4,
	fps: 8,
});

export const sheetChargeOrb = new ImgSlideshow({
	asset: assetChargeOrb,
	assetWidth: 2500,
	assetHeight: 500,
	frames: 5,
	fps: 6,
});

export const sheetShockSquare = new ImgSlideshow({
	asset: assetShockSquare,
	assetWidth: 1500,
	assetHeight: 500,
	frames: 3,
	fps: 3,
});

export const sheetShockRectBL = new ImgSlideshow({
	asset: assetShockRectBL,
	assetWidth: 5000,
	assetHeight: 200,
	frames: 5,
	fps: 6,
});

export const sheetShockRectTR = new ImgSlideshow({
	asset: assetShockRectTR,
	assetWidth: 5000,
	assetHeight: 200,
	frames: 5,
	fps: 6,
});
