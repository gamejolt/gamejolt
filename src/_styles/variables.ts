/**
 * A simple wrapper around a CSS pixel value.
 */
export class CSSPixelValue {
	constructor(public readonly value: number) {}

	/**
	 * Will return the value with `px` appended to be used in a CSS property.
	 */
	get px() {
		return `${this.value}px`;
	}
}

export const kGridColumns = new CSSPixelValue(12);
export const kGridGutterWidth = new CSSPixelValue(40);
export const kGridGutterWidthXs = new CSSPixelValue(16 * 2);

export const kBorderRadiusBase = new CSSPixelValue(6);
export const kBorderRadiusSm = new CSSPixelValue(2);
export const kBorderRadiusLg = new CSSPixelValue(12);

export const kBorderWidthBase = new CSSPixelValue(1.5);
export const kBorderWidthSm = new CSSPixelValue(1);
export const kBorderWidthLg = new CSSPixelValue(2);

export const kFontFamilySansSerif = `'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
export const kFontFamilyHeading = `'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
export const kFontFamilySerif = `Georgia, 'Times New Roman', Times, serif`;
export const kFontFamilyMonospace = `Inconsolata, Menlo, Monaco, 'Ubuntu Mono', Consolas, 'source-code-pro', 'Courier New', monospace`;
export const kFontFamilyDisplay = `'Staatliches', 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
export const kFontFamilyBase = kFontFamilySansSerif;
export const kFontFamilyTiny = kFontFamilyBase;

export const kFontSizeBase = new CSSPixelValue(15);
export const kFontSizeTiny = new CSSPixelValue(11);
export const kFontSizeLarge = new CSSPixelValue(19);
export const kFontSizeSmall = new CSSPixelValue(13);
export const kFontSizeH1 = new CSSPixelValue(28);
export const kFontSizeH2 = new CSSPixelValue(24);
export const kFontSizeH3 = new CSSPixelValue(21);
export const kFontSizeH4 = new CSSPixelValue(18);
export const kFontSizeH5 = new CSSPixelValue(kFontSizeBase.value);
export const kFontSizeH6 = new CSSPixelValue(13);

export const kJolticonSize = new CSSPixelValue(16);

export const kLineHeightBase = 1.428571429;
export const kLineHeightComputed = new CSSPixelValue(
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
export const kLayerPlayButtonOverlay = 11;
export const kLayerStickerLayer = kLayerModal + 1;
