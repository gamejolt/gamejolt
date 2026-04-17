import { CSSProperties, StyleValue } from 'vue';

/**
 * Helper to enforce the typing of a style binding for an element.
 *
 * Using `v-bind` on an element breaks the typing for normal style bindings. Use
 * this to fix that.
 *
 * NOTE: Don't use an array of styles with this if it's used in the `<script>`
 * tag or things will break.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function styleTyped(value: StyleValue) {
	return value;
}

/**
 * Make a caret! Not for rabbits.
 */
export function styleCaret(
	color: string,
	direction: 'left' | 'right' | 'down' | 'up' = `left`,
	size = `3px`
) {
	const result = {
		position: `absolute`,
		width: `0`,
		height: `0`,
		borderTop: `${size} solid transparent`,
		borderRight: `${size} solid transparent`,
		borderBottom: `${size} solid transparent`,
		borderLeft: `${size} solid transparent`,
		// Reset in case we stacked this mixin.
		top: `auto`,
		left: `auto`,
		right: `auto`,
		bottom: `auto`,
		marginTop: `0`,
		marginLeft: `0`,
	} satisfies CSSProperties;

	if (direction == 'left' || direction == 'right') {
		result.top = `50%`;
		result.marginTop = `-${size}`;
	} else if (direction == 'up' || direction == 'down') {
		result.left = `50%`;
		result.marginLeft = `-${size}`;
	}

	if (direction == 'left') {
		result.left = `-${size}`;
		result.borderRight = `${size} solid ${color}`;
		result.borderLeft = `none`;
	} else if (direction == 'up') {
		result.top = `-${size}`;
		result.borderBottom = `${size} solid ${color}`;
		result.borderTop = `none`;
	} else if (direction == 'right') {
		result.right = `-${size}`;
		result.borderLeft = `${size} solid ${color}`;
		result.borderRight = `none`;
	} else if (direction == 'down') {
		result.bottom = `-${size}`;
		result.borderTop = `${size} solid ${color}`;
		result.borderBottom = `none`;
	}
	return result;
}

export const kElevateTransition = `box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)`;

export function styleLineClamp(lines = 2) {
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
	} satisfies CSSProperties;
}

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
