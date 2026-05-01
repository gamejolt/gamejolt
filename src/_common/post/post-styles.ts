import { CSSProperties, MaybeRefOrGetter, toValue } from 'vue';

import { getScreen } from '~common/screen/screen-service';
import { kThemeFgMuted, kThemeLink } from '~common/theme/variables';
import {
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
	styleTextOverflow,
	styleWhen,
} from '~styles/mixins';
import {
	buildCSSPixelValue,
	kBorderWidthBase,
	kFontSizeSmall,
	kGridGutterWidth,
	kGridGutterWidthXs,
	kLineHeightComputed,
} from '~styles/variables';

export const kPostBorderWidth = kBorderWidthBase;
export const kPostItemPadding = buildCSSPixelValue(kGridGutterWidth.value / 2);
export const kPostItemPaddingXs = buildCSSPixelValue(kGridGutterWidthXs.value / 2);
export const kPostItemPaddingVertical = buildCSSPixelValue(kPostItemPadding.value * 0.75);
export const kPostItemPaddingXsVertical = buildCSSPixelValue(kPostItemPaddingXs.value * 0.75);
export const kPostAvatarSize = buildCSSPixelValue(40);
// This is the padding around the event item container. We do it this way to fit the grid.
export const kPostItemPaddingContainer = buildCSSPixelValue(
	kPostItemPadding.value - kPostBorderWidth.value
);

/**
 * Used when the text is being overlayed on top of a background image.
 */
export const PostOverlayTextStyles = {
	color: `white`,
	textShadow: `black 1px 1px 4px`,
} as const satisfies CSSProperties;

////////////////////////////////////////////
// Feed

export function getPostFeedItemContainerStyles() {
	return {
		paddingBottom: getScreen().isXs.value
			? kPostItemPaddingXsVertical.px
			: kPostItemPaddingVertical.px,
	} as const satisfies CSSProperties;
}

function getPostFeedItemPaddingStyles() {
	return getScreen().isXs.value
		? ({
				paddingTop: kPostItemPaddingXsVertical.px,
				paddingBottom: kPostItemPaddingXsVertical.px,
				paddingLeft: kPostItemPaddingXs.px,
				paddingRight: kPostItemPaddingXs.px,
			} as const satisfies CSSProperties)
		: ({
				paddingTop: kPostItemPaddingVertical.px,
				paddingBottom: kPostItemPaddingVertical.px,
				paddingLeft: kPostItemPaddingContainer.px,
				paddingRight: kPostItemPaddingContainer.px,
			} as const satisfies CSSProperties);
}

/**
 * Will return styling to make a "post feed item".
 */
export const stylePostFeedItem = (options: { isHovered: MaybeRefOrGetter<boolean> }) => {
	const isHovered = toValue(options.isHovered);

	return {
		...getPostFeedItemPaddingStyles(),
		...styleChangeBg('bg'),
		overflow: `hidden`,
		position: `relative`,
		zIndex: 1,
		...styleWhen(getScreen().isXs.value, {
			...styleElevate(1),
			marginLeft: `-${kPostItemPaddingXs.value}px`,
			marginRight: `-${kPostItemPaddingXs.value}px`,
		}),
		...styleWhen(!getScreen().isXs.value, {
			...styleElevate(3),
			...styleBorderRadiusLg,
			borderWidth: kPostBorderWidth.px,
			borderStyle: `solid`,
			borderColor: `transparent`,
		}),
		...styleWhen(isHovered, {
			borderColor: kThemeLink,
			cursor: `pointer`,
		}),
		// Keep this down here since it needs to write the transition from the
		// elevate mixin.
		transition: `border-color 200ms ease`,
	} satisfies CSSProperties;
};

////////////////////////////////////////////
// Header

export const PostHeaderStyles = {
	display: `flex`,
	alignItems: `center`,
} as const satisfies CSSProperties;

export function getPostHeaderAvatarStyles() {
	return {
		position: `relative`,
		flex: `none`,
		marginRight: getScreen().isMobile.value ? kPostItemPaddingXs.px : kPostItemPadding.px,
		width: kPostAvatarSize.px,
		height: kPostAvatarSize.px,
		lineHeight: kPostAvatarSize.px,
		marginBottom: `4px`,
	} as const satisfies CSSProperties;
}

export const PostHeaderContentStyles = {
	flex: `auto`,
	display: `flex`,
	alignItems: `center`,
	overflow: `hidden`,
} as const satisfies CSSProperties;

export const PostHeaderBylineStyles = {
	display: `flex`,
	flexDirection: `column`,
	overflow: `hidden`,
} as const satisfies CSSProperties;

export const PostHeaderBylineNameStyles = (overlay: boolean) => {
	return {
		fontWeight: `bold`,
		...styleTextOverflow,
		...styleWhen(overlay, PostOverlayTextStyles),
	} as const satisfies CSSProperties;
};

export const PostHeaderBylineUsernameStyles = (overlay: boolean) => {
	return {
		fontWeight: `normal`,
		fontSize: kFontSizeSmall.px,
		color: kThemeFgMuted,
		...styleWhen(overlay, PostOverlayTextStyles),
	} as const satisfies CSSProperties;
};

export const PostHeaderBylineGameStyles = (overlay: boolean) => {
	return {
		color: kThemeFgMuted,
		fontWeight: `bold`,
		...styleTextOverflow,
		...styleWhen(overlay, PostOverlayTextStyles),
	} as const satisfies CSSProperties;
};

export const PostHeaderTimeStyles = (overlay: boolean) => {
	return {
		...styleWhen(overlay, PostOverlayTextStyles),
	} as const satisfies CSSProperties;
};

export function getPostHeaderMetaStyles() {
	return {
		flex: `none`,
		display: `flex`,
		alignItems: `center`,
		flexDirection: `row`,
		gridGap: `8px`,
		marginLeft: getScreen().isMobile.value ? kPostItemPaddingXs.px : kPostItemPadding.px,
		lineHeight: kLineHeightComputed.px,
		fontSize: kFontSizeSmall.px,
		color: kThemeFgMuted,
	} as const satisfies CSSProperties;
}

////////////////////////////////////////////
// Content

export const PostContentContainerStyles = (overlay: boolean) => {
	if (!overlay) {
		return {} as CSSProperties;
	}

	const padding = getScreen().isMobile.value
		? kPostItemPaddingXs.value / 2
		: kPostItemPadding.value / 2;
	return {
		...styleBorderRadiusLg,
		...styleChangeBg('bg'),
		...styleElevate(1),
		overflow: `hidden`,
		padding: `0 ${padding}px`,
		margin: `${padding}px 0`,
	} as const satisfies CSSProperties;
};

export function getPostContentLeadStyles() {
	const margin = getScreen().isMobile.value
		? kPostItemPaddingXsVertical.px
		: kPostItemPaddingVertical.px;
	return {
		marginTop: margin,
		marginBottom: margin,
	} as const satisfies CSSProperties;
}
