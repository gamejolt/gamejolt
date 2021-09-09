import VueRouter from 'vue-router';
import { getAbsoluteLink } from '../../../../utils/router';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresideRTC } from '../../../../_common/fireside/rtc/rtc';
import { Screen } from '../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../_common/share/share.service';
import { appStore } from '../../../../_common/store/app-store';
import { ChatClient } from '../../../components/chat/client';
import { ChatRoomChannel } from '../../../components/chat/room-channel';
import { FiresideChannel } from '../../../components/grid/fireside-channel';
import { FiresideChatMembersModal } from '../_chat-members/modal/modal.service';

export type RouteStatus =
	| 'initial' // Initial status when route loads.
	| 'disconnected' // Disconnected from the Fireside (chat/client channels).
	| 'loading' // Initiated loading to connect to relevant channels.
	| 'unauthorized' // Cannot join because user is not logged in/has no cookie.
	| 'expired' // Fireside has expired.
	| 'setup-failed' // Failed to properly join the Fireside.
	| 'joined' // Currently joined to the Fireside.
	| 'blocked'; // Blocked from joining the Fireside (user blocked).

export const FiresideControllerKey = Symbol('fireside-controller');

export class FiresideController {
	constructor(public readonly fireside: Fireside, public readonly streamingAppId: string) {}

	rtc: FiresideRTC | null = null;
	status: RouteStatus = 'initial';
	onRetry: (() => void) | null = null;

	chat: ChatClient | null = null;

	gridChannel: FiresideChannel | null = null;
	chatChannel: ChatRoomChannel | null = null;
	expiryInterval: NodeJS.Timer | null = null;
	chatPreviousConnectedState: boolean | null = null;
	gridPreviousConnectedState: boolean | null = null;

	/**
	 * Visually shows a warning to the owner when the fireside's time is running
	 * low.
	 */
	hasExpiryWarning = false;

	isShowingStreamOverlay = false;
	isShowingOverlayPopper = false;

	get user() {
		return appStore.state.user;
	}

	get isDraft() {
		return this.fireside?.is_draft ?? true;
	}

	get isStreaming() {
		return !!(this.fireside?.is_streaming && this.rtc && this.rtc.users.length > 0);
	}

	get isPersonallyStreaming() {
		return this.rtc?.isStreaming ?? false;
	}

	get shouldShowStreamingOptions() {
		return this.canStream || this.isPersonallyStreaming;
	}

	get canStream() {
		return (
			!!this.rtc?.producer &&
			!!(Screen.isDesktop || (this.user && this.user.permission_level >= 4))
		);
	}

	get chatRoom() {
		return this.chatChannel?.room;
	}

	get chatUsers() {
		if (!this.chatRoom) {
			return undefined;
		}
		return this.chat?.roomMembers[this.chatRoom.id];
	}
}

export function createFiresideController(
	fireside: Fireside,
	streamingAppId: string,
	onRetry: (() => void) | null = null
) {
	const c = new FiresideController(fireside, streamingAppId);
	c.onRetry = onRetry;
	return c;
}

export function getFiresideLink(c: FiresideController, router: VueRouter) {
	if (!c.fireside) {
		return;
	}
	return getAbsoluteLink(router, c.fireside.location);
}

export function copyFiresideLink(c: FiresideController, router: VueRouter) {
	const url = getFiresideLink(c, router);
	if (url) {
		copyShareLink(url, 'fireside');
	}
}

export function showFiresideMembers(c: FiresideController) {
	if (!c.chatUsers || !c.chatRoom) {
		return;
	}
	FiresideChatMembersModal.show(c.chatUsers, c.chatRoom);
}

export function toggleStreamVideoStats(c: FiresideController) {
	c.rtc!.shouldShowVideoStats = !(c.rtc?.shouldShowVideoStats ?? true);
}
