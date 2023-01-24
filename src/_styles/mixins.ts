import { CSSProperties } from 'vue';
import { ThemeColor } from '../_common/theme/variables';
import { kBorderRadiusBase, kBorderRadiusLg, kBorderRadiusSm } from './variables';

/**
 * Helper to make it easier to mix certain styles into a style binding depending
 * on a condition.
 */
export const styleWhen = (condition: boolean, style: CSSProperties) => (condition ? style : {});

export const styleBorderRadiusCircle: CSSProperties = {
	borderRadius: `50%`,
};

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

export const styleChangeBg = (bg: ThemeColor, important = false): any => ({
	'--theme-bg-actual': `var(--theme-${bg})`,
	'--theme-bg-actual-trans': `var(--theme-${bg}-trans)`,
	backgroundColor: `var(--theme-${bg})` + important ? ' !important' : '',
});
