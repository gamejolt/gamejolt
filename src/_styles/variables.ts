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

export const kLineHeightBase = 1.428571429;
export const kLineHeightComputed = new CSSPixelValue(
	Math.floor(kFontSizeBase.value * kLineHeightBase)
);
