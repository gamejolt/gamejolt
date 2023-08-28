import { CSSProperties } from 'vue';
import { ThemeColor } from '../_common/theme/variables';
import { kBorderRadiusBase, kBorderRadiusLg, kBorderRadiusSm } from './variables';

/**
 * Helper to make it easier to mix certain styles into a style binding depending
 * on a condition.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function styleWhen(condition: boolean | null | undefined, style: CSSProperties) {
	return condition ? style : {};
}

export const styleBorderRadiusBase: CSSProperties = {
	borderRadius: kBorderRadiusBase.px,
};

export const styleBorderRadiusSm: CSSProperties = {
	borderRadius: kBorderRadiusSm.px,
};

export const styleBorderRadiusLg: CSSProperties = {
	borderRadius: kBorderRadiusLg.px,
};

/**
 * Requires inline-block or block for proper styling
 */
export const styleTextOverflow: CSSProperties = {
	overflow: `hidden`,
	whiteSpace: `nowrap`,
	textOverflow: `ellipsis`,
};

export function styleChangeBg(bg: ThemeColor, important = false): any {
	return {
		'--theme-bg-actual': `var(--theme-${bg})`,
		'--theme-bg-actual-trans': `var(--theme-${bg}-trans)`,
		backgroundColor: `var(--theme-${bg})` + (important ? ' !important' : ''),
	};
}

/**
 * Same as [styleChangeBg] but changes the background to an rgba value.
 *
 * @param rgb The rgb value to use. Should be in the format of "r, g, b".
 */
export function styleChangeBgRgba(rgb: string, opacity: number, important = false): any {
	const rgba = `rgba(${rgb}, ${opacity})`;
	return {
		'--theme-bg-actual': rgba,
		'--theme-bg-actual-trans': `rgba(${rgb}, 0)`,
		backgroundColor: `${rgba}` + (important ? ' !important' : ''),
	};
}

/**
 * Will style a particular element to scrollable on the y-axis.
 */
export const styleScrollable: CSSProperties = {
	overflowY: `auto`,
	overflowX: `hidden`,
	willChange: `scroll-position`,
	'-webkit-overflow-scrolling': `touch`,
};

/**
 * Will style a particular element to scrollable on the x-axis.
 */
export const styleScrollableX: CSSProperties = {
	overflowY: `hidden`,
	overflowX: `auto`,
	willChange: `scroll-position`,
	'-webkit-overflow-scrolling': `touch`,
};

/**
 * Will style the box such that it looks like it elevates off the page. You can
 * control elevation with the argument.
 */
export function styleElevate(elevation: number): CSSProperties {
	const umbraZValue = _mdcElevationUmbraMap[elevation];
	const penumbraZValue = _mdcElevationPenumbraMap[elevation];
	const ambientZValue = _mdcElevationAmbientMap[elevation];

	return {
		..._elevateTransition,
		boxShadow: `${umbraZValue} ${_mdcUmbraColor}, ${penumbraZValue} ${_mdcPenumbraColor}, ${ambientZValue} ${_mdcAmbientColor}`,
	};
}

const _elevateTransition: CSSProperties = {
	// If elevations change, we want to transition the shadow.
	transition: `box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
};

const _mdcElevationUmbraMap: Record<number, string> = {
	0: '0px 0px 0px 0px',
	1: '0px 2px 1px -1px',
	2: '0px 3px 1px -2px',
	3: '0px 3px 3px -2px',
	4: '0px 2px 4px -1px',
	5: '0px 3px 5px -1px',
	6: '0px 3px 5px -1px',
	7: '0px 4px 5px -2px',
	8: '0px 5px 5px -3px',
	9: '0px 5px 6px -3px',
	10: '0px 6px 6px -3px',
	11: '0px 6px 7px -4px',
	12: '0px 7px 8px -4px',
	13: '0px 7px 8px -4px',
	14: '0px 7px 9px -4px',
	15: '0px 8px 9px -5px',
	16: '0px 8px 10px -5px',
	17: '0px 8px 11px -5px',
	18: '0px 9px 11px -5px',
	19: '0px 9px 12px -6px',
	20: '0px 10px 13px -6px',
	21: '0px 10px 13px -6px',
	22: '0px 10px 14px -6px',
	23: '0px 11px 14px -7px',
	24: '0px 11px 15px -7px',
};

const _mdcElevationPenumbraMap: Record<number, string> = {
	0: '0px 0px 0px 0px',
	1: '0px 1px 1px 0px',
	2: '0px 2px 2px 0px',
	3: '0px 3px 4px 0px',
	4: '0px 4px 5px 0px',
	5: '0px 5px 8px 0px',
	6: '0px 6px 10px 0px',
	7: '0px 7px 10px 1px',
	8: '0px 8px 10px 1px',
	9: '0px 9px 12px 1px',
	10: '0px 10px 14px 1px',
	11: '0px 11px 15px 1px',
	12: '0px 12px 17px 2px',
	13: '0px 13px 19px 2px',
	14: '0px 14px 21px 2px',
	15: '0px 15px 22px 2px',
	16: '0px 16px 24px 2px',
	17: '0px 17px 26px 2px',
	18: '0px 18px 28px 2px',
	19: '0px 19px 29px 2px',
	20: '0px 20px 31px 3px',
	21: '0px 21px 33px 3px',
	22: '0px 22px 35px 3px',
	23: '0px 23px 36px 3px',
	24: '0px 24px 38px 3px',
};

const _mdcElevationAmbientMap: Record<number, string> = {
	0: '0px 0px 0px 0px',
	1: '0px 1px 3px 0px',
	2: '0px 1px 5px 0px',
	3: '0px 1px 8px 0px',
	4: '0px 1px 10px 0px',
	5: '0px 1px 14px 0px',
	6: '0px 1px 18px 0px',
	7: '0px 2px 16px 1px',
	8: '0px 3px 14px 2px',
	9: '0px 3px 16px 2px',
	10: '0px 4px 18px 3px',
	11: '0px 4px 20px 3px',
	12: '0px 5px 22px 4px',
	13: '0px 5px 24px 4px',
	14: '0px 5px 26px 4px',
	15: '0px 6px 28px 5px',
	16: '0px 6px 30px 5px',
	17: '0px 6px 32px 5px',
	18: '0px 7px 34px 6px',
	19: '0px 7px 36px 6px',
	20: '0px 8px 38px 7px',
	21: '0px 8px 40px 7px',
	22: '0px 8px 42px 7px',
	23: '0px 9px 44px 8px',
	24: '0px 9px 46px 8px',
};

// The opacities were tweaked from material design to be a little softer.
const _mdcUmbraColor = `rgba(0, 0, 0, 0.15)`;
const _mdcPenumbraColor = `rgba(0, 0, 0, 0.1)`;
const _mdcAmbientColor = `rgba(0, 0, 0, 0.09)`;

export function styleLineClamp(lines = 2): CSSProperties {
	return {
		// https://github.com/postcss/autoprefixer/issues/1141#issuecomment-431280891
		overflow: `hidden`,
		display: `-webkit-box`,
		'-webkit-line-clamp': lines,
		/* autoprefixer: ignore next */
		'-webkit-box-orient': `vertical`,
		// Safari doesn't currently support `overflow-wrap: anywhere`, but this
		// should be identical.
		wordBreak: `break-word`,
		overflowWrap: `anywhere`,
	};
}

export function styleFlexCenter({
	display = 'flex',
	direction,
}: {
	display?: 'flex' | 'inline-flex';
	direction?: CSSProperties['flex-direction'];
} = {}): CSSProperties {
	return {
		display,
		alignItems: `center`,
		justifyContent: `center`,
		...styleWhen(!!direction, {
			flexDirection: direction,
		}),
	};
}

export function styleAbsoluteFill({
	inset = 0,
	top,
	right,
	bottom,
	left,
	zIndex,
}: {
	inset?: string | 0;
	top?: string | 0;
	right?: string | 0;
	bottom?: string | 0;
	left?: string | 0;
	zIndex?: CSSProperties['zIndex'];
} = {}) {
	const result: CSSProperties = {
		position: `absolute`,
		top: top ?? inset,
		left: left ?? inset,
		right: right ?? inset,
		bottom: bottom ?? inset,
	};
	if (zIndex !== undefined) {
		result.zIndex = zIndex;
	}
	return result;
}

export const styleOverlayTextShadow: CSSProperties = {
	textShadow: `0.5px 0.5px 1.5px rgba(0, 0, 0, 0.38)`,
};

// Used for the overlayed text on the fireside page specifically
export const styleFiresideOverlayTextShadow: CSSProperties = {
	textShadow: `0px 4px 4px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.15), 0px 1px 8px rgba(0, 0, 0, 0.09)`,
};

type MaxWidthForOptionsResult = { maxWidth?: string };

/**
 * Returns a max-width CSS binding based on the given options.
 *
 * Returns an empty result if max-width can't be determined.
 */
export function styleMaxWidthForOptions(_: {
	ratio: number;
	maxWidth: number;
}): MaxWidthForOptionsResult;
export function styleMaxWidthForOptions(_: {
	ratio: number;
	maxHeight: number;
}): MaxWidthForOptionsResult;
export function styleMaxWidthForOptions(_: {
	ratio: number;
	maxWidth: number;
	maxHeight: number;
}): MaxWidthForOptionsResult;
export function styleMaxWidthForOptions(options: {
	ratio: number;
	maxWidth?: number;
	maxHeight?: number;
}): MaxWidthForOptionsResult {
	const { ratio, maxWidth, maxHeight } = options;
	const result: MaxWidthForOptionsResult = {};

	// A positive aspect ratio is required to calculate max width.
	if (!ratio) {
		return result;
	}

	if (maxWidth && maxHeight) {
		result.maxWidth = `${Math.min(maxWidth, maxHeight * ratio)}px`;
	} else if (maxWidth) {
		result.maxWidth = `${maxWidth}px`;
	} else if (maxHeight) {
		result.maxWidth = `${maxHeight * ratio}px`;
	}
	return result;
}
