import { CSSProperties } from 'vue';
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
