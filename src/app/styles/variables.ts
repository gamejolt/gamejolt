import { buildCSSPixelValue, kGridGutterWidth, kGridGutterWidthXs } from '../../_styles/variables';

/**
 * Shell
 */
export const kShellBorderColor = `#000`;

export const kShellPaneWidth = buildCSSPixelValue(280);
export const kShellTopNavHeight = buildCSSPixelValue(56);
export const kShellUserBoxHeight = buildCSSPixelValue(125);
export const kShellCbarWidth = buildCSSPixelValue(70);
export const kStatusBarHeight = buildCSSPixelValue(28);
export const kShellContentSidebarPadding = buildCSSPixelValue(12);
export const kShellContentSidebarWidth = buildCSSPixelValue(
	270 + kShellContentSidebarPadding.value * 2
);
export const kShellBodyContentBg = `#fff`;

/**
 * Chat
 */
export const kChatBubbleSize = buildCSSPixelValue(60);
export const kChatRoomWindowWidth = buildCSSPixelValue(900);
export const kChatRoomWindowPaddingH = buildCSSPixelValue(12);
export const kChatRoomWindowPaddingV = buildCSSPixelValue(16);
/** This includes v and h padding as a string. */
export const kChatRoomWindowPadding = `${kChatRoomWindowPaddingV.px} ${kChatRoomWindowPaddingH.px}`;

/**
 * Forums
 */
export const kForumPostListIconSize = buildCSSPixelValue(50);
export const kForumPostListAvatarMargin = buildCSSPixelValue(kGridGutterWidth.value);

/**
 * Minbar
 */
export const kMinbarOffsetRight = buildCSSPixelValue(kChatBubbleSize.value);

/**
 * Modals
 */
export const kModalPadding = buildCSSPixelValue(kGridGutterWidth.value / 2);
export const kModalPaddingXs = buildCSSPixelValue(kGridGutterWidthXs.value / 2);

/**
 * Page Header
 */
export const kPageHeaderSpotlightSize = buildCSSPixelValue(100);
export const kPageHeaderSpotlightMargin = buildCSSPixelValue(kGridGutterWidth.value / 2);

/**
 * Cbar
 */
export const kCbarHPadding = buildCSSPixelValue(10);
