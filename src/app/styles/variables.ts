import { CSSPixelValue, kGridGutterWidth, kGridGutterWidthXs } from '../../_styles/variables';

/**
 * Shell
 */
export const kShellBorderColor = `#000`;

export const kShellPaneWidth = new CSSPixelValue(280);
export const kShellTopNavHeight = new CSSPixelValue(56);
export const kShellUserBoxHeight = new CSSPixelValue(125);
export const kShellCbarWidth = new CSSPixelValue(70);
export const kStatusBarHeight = new CSSPixelValue(28);
export const kShellContentSidebarPadding = new CSSPixelValue(12);
export const kShellContentSidebarWidth = new CSSPixelValue(
	270 + kShellContentSidebarPadding.value * 2
);
export const kShellBodyContentBg = `#fff`;

/**
 * Chat
 */
export const kChatBubbleSize = new CSSPixelValue(60);
export const kChatRoomWindowWidth = new CSSPixelValue(900);
export const kChatRoomWindowPaddingH = new CSSPixelValue(12);
export const kChatRoomWindowPaddingV = new CSSPixelValue(16);
/** This includes v and h padding as a string. */
export const kChatRoomWindowPadding = `${kChatRoomWindowPaddingV.px} ${kChatRoomWindowPaddingH.px}`;

/**
 * Forums
 */
export const kForumPostListIconSize = new CSSPixelValue(50);
export const kForumPostListAvatarMargin = new CSSPixelValue(kGridGutterWidth.value);

/**
 * Minbar
 */
export const kMinbarOffsetRight = new CSSPixelValue(kChatBubbleSize.value);

/**
 * Modals
 */
export const kModalPadding = new CSSPixelValue(kGridGutterWidth.value / 2);
export const kModalPaddingXs = new CSSPixelValue(kGridGutterWidthXs.value / 2);

/**
 * Page Header
 */
export const kPageHeaderSpotlightSize = new CSSPixelValue(100);
export const kPageHeaderSpotlightMargin = new CSSPixelValue(kGridGutterWidth.value / 2);

/**
 * Cbar
 */
export const kCbarHPadding = new CSSPixelValue(10);
