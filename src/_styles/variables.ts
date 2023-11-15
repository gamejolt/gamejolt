/**
 * A simple wrapper around a CSS pixel value.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function buildCSSPixelValue(value: number) {
	return Object.freeze({
		value,
		get px() {
			return `${value}px`;
		},
	});
}

export type CSSPixelValue = ReturnType<typeof buildCSSPixelValue>;

export const kGridColumns = buildCSSPixelValue(12);
export const kGridGutterWidth = buildCSSPixelValue(40);
export const kGridGutterWidthXs = buildCSSPixelValue(16 * 2);

export const kBorderRadiusBase = buildCSSPixelValue(6);
export const kBorderRadiusSm = buildCSSPixelValue(2);
export const kBorderRadiusLg = buildCSSPixelValue(12);

export const kBorderWidthBase = buildCSSPixelValue(1.5);
export const kBorderWidthSm = buildCSSPixelValue(1);
export const kBorderWidthLg = buildCSSPixelValue(2);

export const kFontFamilySansSerif = `'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
export const kFontFamilyHeading = `'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
export const kFontFamilySerif = `Georgia, 'Times New Roman', Times, serif`;
export const kFontFamilyMonospace = `Inconsolata, Menlo, Monaco, 'Ubuntu Mono', Consolas, 'source-code-pro', 'Courier New', monospace`;
export const kFontFamilyDisplay = `'Staatliches', 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
export const kFontFamilyBase = kFontFamilySansSerif;
export const kFontFamilyTiny = kFontFamilyBase;

export const kFontSizeBase = buildCSSPixelValue(15);
export const kFontSizeTiny = buildCSSPixelValue(11);
export const kFontSizeLarge = buildCSSPixelValue(19);
export const kFontSizeSmall = buildCSSPixelValue(13);
export const kFontSizeH1 = buildCSSPixelValue(28);
export const kFontSizeH2 = buildCSSPixelValue(24);
export const kFontSizeH3 = buildCSSPixelValue(21);
export const kFontSizeH4 = buildCSSPixelValue(18);
export const kFontSizeH5 = buildCSSPixelValue(kFontSizeBase.value);
export const kFontSizeH6 = buildCSSPixelValue(13);

export const kJolticonSize = buildCSSPixelValue(16);

export const kLineHeightBase = 1.428571429;
export const kLineHeightComputed = buildCSSPixelValue(
	Math.floor(kFontSizeBase.value * kLineHeightBase)
);

// Animations
export const kWeakEaseIn = `cubic-bezier(0.55, 0.085, 0.68, 0.53)`;
export const kWeakEaseOut = `cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
export const kWeakEaseInOut = `cubic-bezier(0.455, 0.03, 0.515, 0.955)`;
// Quart
export const kEaseIn = `cubic-bezier(0.895, 0.03, 0.685, 0.22)`;
export const kEaseOut = `cubic-bezier(0.165, 0.84, 0.44, 1)`;
export const kEaseInOut = `cubic-bezier(0.77, 0, 0.175, 1)`;
// Expo
export const kStrongEaseIn = `cubic-bezier(0.95, 0.05, 0.795, 0.035)`;
export const kStrongEaseOut = `cubic-bezier(0.19, 1, 0.2, 1)`;
export const kStrongEaseInOut = `cubic-bezier(1, 0, 0, 1)`;
// Back Easing
export const kEaseInBack = `cubic-bezier(0.6, -0.28, 0.735, 0.045)`;
export const kEaseOutBack = `cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
export const kEaseInOutBack = `cubic-bezier(0.68, -0.55, 0.265, 1.55)`;

export const kLayerModal = 1050;
export const kLayerPopover = 1060;
export const kLayerTooltip = 1300;
export const kLayerLoadingBar = 2000;
export const kLayerGrowls = 1200;
export const kLayerContentEditor = 200;
export const kLayerBackdrop = 20;
export const kLayerAds = 19;
export const kLayerPlayButtonOverlay = 11;
export const kLayerStickerLayer = kLayerModal + 1;
