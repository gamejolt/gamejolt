import {
	complement,
	desaturate,
	hsl,
	mix,
	parseToHsl,
	parseToRgb,
	readableColor,
	rgb,
	rgbToColorString,
} from 'polished';
import { RgbColor } from 'polished/lib/types/color';
import { lab2rgb, rgb2lab } from '../../utils/color';
import { Model } from '../model/model.service';
import { ThemePreset } from './preset/preset.model';

// Sync with variables in stylus.

export const GrayDarkest = '#111111';
export const GrayDarker = '#1f1f1f';
export const GrayDark = '#292929';
export const Gray = '#363636';
export const GraySubtle = '#444444';
export const GrayLight = '#7e7e7e';
export const GrayLighter = '#a8a8a8';
export const GrayLightest = '#f0f0f0';
export const BgBackdropLight = '#f8f8f8';
export const BgBackdropDark = '#222222';

// For clamping custom colors.
//   ("MinLitBase" is summed with a variable portion of BlueBoost for MinLitFinal.)
const MaxLitBase = 0.8; // Base lightness ceiling in Light mode.
const MinLitBase = 0.45; // Base lightness floor in Dark mode.  (Originally 0.45. Tried 0.43 & it works.)
const BlueBoost = 0.2; // Extra blue brightness in Dark mode. (Originally 0.2.  Tried 0.18 & it works.)

export function makeThemeFromPreset(preset: ThemePreset) {
	return new Theme({
		theme_preset_id: preset.id,
		highlight: preset.highlight,
		backlight: preset.backlight,
		notice: preset.notice,
		tint: preset.tint,
	});
}

export function makeThemeFromColor(color: string) {
	return new Theme({
		custom: color,
	});
}

function rgb2hsl(color: RgbColor) {
	const str = rgbToColorString(color);
	return parseToHsl(str);
}

/**
 * Transform a 0-to-1 range to map to an arbitrary A-to-B range. e.g. If amount is 0.5, and range is
 * 100 to 200, then return 150. e.g. lerp(100, 200, 0.5) returns 150.
 */
function lerp(low: number, high: number, amount: number) {
	return low * (1 - amount) + high * amount;
}

/**
 * Transform an arbitrary A-to-B range to map to a 0-to-1 range. e.g. If amount is 150, and range is
 * 100 to 200, then return 0.5. e.g. unlerp(100, 200, 150) returns 0.5.
 */
function unlerp(low: number, high: number, amount: number) {
	return (amount - low) / (high - low);
}

/**
 * Transform an arbitrary A-to-B range to map to an arbitrary C-to-D range. e.g. If val is 150,
 * input range is 100 to 200, and output range is 0 to 10, return 5. e.g. remap(150, 100, 200, 0,
 * 10) returns 5.
 */
function remap(val: number, inLow: number, inHigh: number, outLow: number, outHigh: number) {
	return lerp(outLow, outHigh, unlerp(inLow, inHigh, val));
}

/**
 * This is a two ramp envelope function. It ramps up then back down.
 * It takes an input value that falls into the range of the ramps,
 * and remaps it to an output range.
 * It's basically 2 remap functions stuck end-to-end, but with a
 * clamped minimum value, and some extra conveniences.
 *
 * The ramp has a starting point A, middle point B, and an end point C.
 * When the input value ranges from A to B to C,
 * the output ranges from Min to Max to Min.
 *
 *     B      Output params:
 *    /\      Max = the value at the top of the ramp.
 * __/  \__   Min = the value at the bottom of the ramp,
 *  A    C          and all values outside the ramp's A to C range.
 */
function biRamp(
	val: number,
	aInLow: number,
	bInHigh: number,
	cInLow: number,
	outMin: number,
	outMax: number
) {
	let out = outMin;
	if (val >= aInLow && val < bInHigh) {
		out = remap(val, aInLow, bInHigh, outMin, outMax);
	} else if (val >= bInHigh && val <= cInLow) {
		// "C" then "B", because we're ramping back down.
		out = remap(val, cInLow, bInHigh, outMin, outMax);
	}

	return out;
}

function rgbToTuple(rgbObj: RgbColor): [number, number, number] {
	return [rgbObj.red, rgbObj.green, rgbObj.blue];
}

function rgbFromTuple(rgbArray: [number, number, number]): RgbColor {
	return { red: rgbArray[0], green: rgbArray[1], blue: rgbArray[2] };
}

function getReadableCustom(custom: string | undefined, background: 'light' | 'dark') {
	if (!custom) {
		return undefined;
	}

	const initialRgb = parseToRgb('#' + custom);
	const initialRgbArr = rgbToTuple(initialRgb);
	const initialHsl = parseToHsl('#' + custom);
	const labColor = rgb2lab(initialRgbArr);
	const labLitNorm = labColor[0] / 100; // Lab lightness normalized to 0 to 1 range.

	if (background === 'light') {
		// Note: We can use the raw MaxLitBase value for the IF and the clamp, because we don't need
		// any hue dependant modifications.

		// If color's lightness is higher than our preferred ceiling value.
		if (labLitNorm > MaxLitBase) {
			// Force lightness down to preferred ceiling value.
			// Due to the preceding IF, this is essentially a ceiling clamp.
			labColor[0] = MaxLitBase * 100;
			const convertedRgb = lab2rgb(labColor);

			return rgb(rgbFromTuple(convertedRgb)).substr(1);
		}
	} else if (background === 'dark') {
		// IMPORTANT: In Dark mode, we don't just use a single fixed value for the
		// lightness floor. The lightness floor is variable, because we add a portion
		// of the blueBoost value, and the amount of boost we add depends on how close
		// the custom color's hue is to blue. The closer to blue, the greater the boost.
		// When the custom color's hue is pure blue, we add 100% of the blueBoost value
		// to the final floor value.
		// When the custom color's hue is more than 60 degrees away from blue, we add 0%
		// of the blueBoost value to the final floor value.
		// The function that uses the hue to determine how much blueBoost to use is biRamp().
		// Note: Hue degrees, 180 = Cyan, 240 = Blue, 300 = Purple.
		// Finally, we don't want to apply the blue boost if the hue is blue, but the
		// saturation is nearly 0, because that would just boost a nearly gray color, as if
		// it were blue. So we calculate a 0-to-1 "colorfulness" value and use it to scale
		// the amount of blue boost to apply. The colorfulness is just sat * isNear( lit, 0.5 ).

		// Calc clamp params. Then do clamp:
		//   Calc the biRamp boost value for the current hue.
		const biRampBoost = biRamp(initialHsl.hue, 180, 240, 300, 0, BlueBoost);
		//   Calc the "colorfulness" of the current color, because we only need to apply the boost
		const colorfulness = initialHsl.saturation * biRamp(initialHsl.lightness, 0, 0.5, 1, 0, 1);
		//   Calc the final lightness floor value. (This incorporates the blue adjustment.)
		const MinLitAdjusted = MinLitBase + biRampBoost * colorfulness;

		// If color's lightness is lower than our preferred variable floor value
		if (labLitNorm < MinLitAdjusted) {
			// Force lightness up to preferred floor value.
			// Due to the preceding IF, this is essentially a floor clamp.
			// It's roughly equivalent to this:
			//   const clamped = clamp( labLitNorm, MinLitAdjusted, 1 );

			labColor[0] = MinLitAdjusted * 100;
			const convertedRgb = lab2rgb(labColor);
			const convertedHsl = rgb2hsl(rgbFromTuple(convertedRgb));

			// Use the original hue and only use the saturation/lightness from the clamped value.
			const iH = initialHsl.hue;
			const cS = convertedHsl.saturation;
			const cL = convertedHsl.lightness;

			return hsl(iH, cS, cL).substr(1);
		}
	}

	return custom;
}

export class Theme extends Model {
	declare highlight: string;
	declare backlight: string;
	declare notice: string;
	declare tint?: string;
	declare theme_preset_id?: number;
	declare custom?: string;

	constructor(data: any = {}) {
		super(data);

		this.highlight = this.highlight || 'ccff00';
		this.backlight = this.backlight || '2f7f6f';
		this.notice = this.notice || 'ff3fac';
	}

	get highlight_() {
		return this._readableCustomLight || this.highlight;
	}

	get darkHighlight_() {
		return this._readableCustomDark || this.highlight;
	}

	get backlight_() {
		return this._readableCustomLight || this.backlight;
	}

	get darkBacklight_() {
		return this._readableCustomDark || this.backlight;
	}

	get notice_() {
		return this._readableCustomLight || this.notice;
	}

	get darkNotice_() {
		return this._readableCustomDark || this.notice;
	}

	get tint_() {
		return (
			(this.custom && desaturate(0.5, complement('#' + this.custom)).substr(1)) || this.tint
		);
	}

	get highlightFg_() {
		return readableColor('#' + this.highlight_).substr(1);
	}

	get backlightFg_() {
		return readableColor('#' + this.backlight_).substr(1);
	}

	get primaryFg_() {
		return readableColor('#' + this.highlight_).substr(1);
	}

	get darkPrimaryFg_() {
		return readableColor('#' + this.darkHighlight_).substr(1);
	}

	get noticeFg_() {
		return readableColor('#' + this.notice_).substr(1);
	}

	get biBg_() {
		return this._readableCustomLight || this.backlight;
	}

	get biFg_() {
		return this._readableCustomLight
			? readableColor('#' + this.biBg_).substr(1)
			: this.highlight;
	}

	get darkBiBg_() {
		return this._readableCustomDark || this.highlight;
	}

	get darkBiFg_() {
		return this.highlightFg_;
	}

	get bgBackdrop_() {
		return this.tintColor(BgBackdropLight, 0.02);
	}

	get darkBgBackdrop_() {
		return this.tintColor(BgBackdropDark, 0.04);
	}

	get darkest_() {
		return this.tintColor(GrayDarkest, 0.02);
	}

	get darker_() {
		return this.tintColor(GrayDarker, 0.04);
	}

	get dark_() {
		return this.tintColor(GrayDark, 0.04);
	}

	get gray_() {
		return this.tintColor(Gray, 0.04);
	}

	get graySubtle_() {
		return this.tintColor(GraySubtle, 0.04);
	}

	get light_() {
		return this.tintColor(GrayLight, 0.04);
	}

	get lighter_() {
		return this.tintColor(GrayLighter, 0.04);
	}

	get lightest_() {
		return this.tintColor(GrayLightest, 0.04);
	}

	get _readableCustomDark() {
		return getReadableCustom(this.custom, 'dark');
	}

	get _readableCustomLight() {
		return getReadableCustom(this.custom, 'light');
	}

	tintColor(color: string, amount: number) {
		return (this.tint_ ? mix(amount, '#' + this.tint_, color) : color).substr(1);
	}
}

/**
 * Default theme to be used by the whole app. Uses our main theme tint.
 */
export const DefaultTheme = /** @__PURE__ */ new Theme({ tint: '4800ff' });
