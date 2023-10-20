import { IllustrationAsset } from '../../illustration/AppIllustration.vue';
import illChargeOrbEmptyBasePath from '../../illustration/img/charge-orb/base/empty.png';
import illChargeOrbEmptyOctoberPath from '../../illustration/img/charge-orb/october/empty.png';
import assetChargeOrbBottomBase from './sheets/charge-orb/base/bottom.png';
import assetChargeOrbTopBase from './sheets/charge-orb/base/top.png';
import assetChargeOrbBottomOctober from './sheets/charge-orb/october/bottom.png';
import assetChargeOrbTopOctober from './sheets/charge-orb/october/top.png';
import assetFireplace from './sheets/fireplace.png';
import assetShockRectBL from './sheets/shock-rect-bl.png';
import assetShockRectTR from './sheets/shock-rect-tr.png';
import assetShockSquare from './sheets/shock-square.png';

export interface ImgSlideshow {
	readonly asset: string;
	readonly assetWidth: number;
	readonly assetHeight: number;
	readonly frames: number;
	readonly fps: number;
	readonly blankFrames?: number;
}

/** Returns extra data helpers for {@link ImgSlideshow} */
export function getImgSlideshowData(slideshow: ImgSlideshow) {
	const { assetWidth, frames, assetHeight } = slideshow;
	return {
		frameAspectRatio: assetWidth / frames / assetHeight,
	};
}

const month = /** @__PURE__ */ new Date().getMonth();
const isOctober = month === 9;

/**
 * @__NO_SIDE_EFFECTS__
 */
function createSeasonalAsset<T>({ base, october }: { base: T; october?: T }) {
	if (isOctober) {
		return october || base;
	}
	return base;
}

export const sheetFireplace: ImgSlideshow = {
	asset: assetFireplace,
	assetWidth: 2000,
	assetHeight: 500,
	frames: 4,
	fps: 8,
};

export const illChargeOrbEmpty = createSeasonalAsset<IllustrationAsset>({
	base: {
		path: illChargeOrbEmptyBasePath,
		width: 500,
		height: 500,
	},
	october: {
		path: illChargeOrbEmptyOctoberPath,
		width: 500,
		height: 500,
	},
});

export const sheetChargeOrbBottom = createSeasonalAsset<ImgSlideshow>({
	base: {
		asset: assetChargeOrbBottomBase,
		assetWidth: 2500,
		assetHeight: 500,
		frames: 5,
		fps: 3,
	},
	october: {
		asset: assetChargeOrbBottomOctober,
		assetWidth: 2500,
		assetHeight: 500,
		frames: 5,
		fps: 3,
	},
});

export const sheetChargeOrbTop = createSeasonalAsset<ImgSlideshow>({
	base: {
		asset: assetChargeOrbTopBase,
		assetWidth: 2000,
		assetHeight: 500,
		frames: 4,
		blankFrames: 2,
		fps: 6,
	},
	october: {
		asset: assetChargeOrbTopOctober,
		assetWidth: 2500,
		assetHeight: 500,
		frames: 5,
		blankFrames: 2,
		fps: 6,
	},
});

export const sheetShockSquare: ImgSlideshow = {
	asset: assetShockSquare,
	assetWidth: 2500,
	assetHeight: 500,
	frames: 5,
	fps: 6,
};

export const sheetShockRectBL: ImgSlideshow = {
	asset: assetShockRectBL,
	assetWidth: 5000,
	assetHeight: 200,
	frames: 5,
	fps: 6,
};

export const sheetShockRectTR: ImgSlideshow = {
	asset: assetShockRectTR,
	assetWidth: 5000,
	assetHeight: 200,
	frames: 5,
	fps: 6,
};
