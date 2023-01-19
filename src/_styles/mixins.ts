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
	borderRadius: `${kBorderRadiusBase}px`,
};

export const styleBorderRadiusSm: CSSProperties = {
	borderRadius: `${kBorderRadiusSm}px`,
};

export const styleBorderRadiusLg: CSSProperties = {
	borderRadius: `${kBorderRadiusLg}px`,
};

/**
 * Requires inline-block or block for proper styling
 */
export const styleTextOverflow: CSSProperties = {
	overflow: `hidden`,
	whiteSpace: `nowrap`,
	textOverflow: `ellipsis`,
};
