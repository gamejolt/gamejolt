import VueRouter from 'vue-router';
import { getAbsoluteLink } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import { Device } from '../../../../_common/device/device.service';
import { duration } from '../../../../_common/filters/duration';
import { Fireside, FIRESIDE_EXPIRY_THRESHOLD } from '../../../../_common/fireside/fireside.model';
import { FiresideRTC } from '../../../../_common/fireside/rtc/rtc';
import { Growls } from '../../../../_common/growls/growls.service';
import { Screen } from '../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../_common/share/share.service';
import { appStore } from '../../../../_common/store/app-store';
import { Translate } from '../../../../_common/translate/translate.service';
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
	constructor(
		public readonly fireside: Fireside,
		public readonly streamingAppId: string,
		public readonly streamingSessionId: string
	) {}

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
	isShowingStreamSetup = false;

	updateInterval: NodeJS.Timer | null = null;
	totalDurationText: string | null = null;
	expiresDurationText: string | null = null;
	expiresProgressValue: number | null = null;

	_isExtending = false;

	get user() {
		return appStore.state.user;
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

	get canManage() {
		if (!this.fireside) {
			return false;
		}

		return (
			(this.user && this.user.id === this.fireside.user.id) ||
			this.fireside.community?.hasPerms('community-firesides')
		);
	}

	get canPublish() {
		return this.canManage && this.status === 'joined' && this.isDraft;
	}

	get canExtend() {
		return (
			this.canManage &&
			this.status === 'joined' &&
			this.expiresProgressValue !== null &&
			this.expiresProgressValue <= 95
		);
	}

	/**
	 * Contains a block-list of browsers/clients that can't broadcast.
	 *
	 * Should suggest known-working browser instead of displaying stream-setup
	 * form.
	 */
	get canBrowserStream() {
		return !(GJ_IS_CLIENT || this.isFirefox || this.isSafari);
	}

	/**
	 * Contains a block-list of browsers/clients that have issues viewing
	 * broadcasts.
	 *
	 * When we should suggest a different browser, but not necessarily block
	 * them from browsing.
	 */
	get shouldNotViewStreams() {
		return GJ_IS_CLIENT || this.isFirefox;
	}

	private get browser() {
		return Device.browser().toLowerCase();
	}

	// Broadcasts and views poorly
	private get isFirefox() {
		return this.browser.indexOf('firefox') !== -1;
	}

	// Can't broadcast - incapable of dual streams
	private get isSafari() {
		return this.browser.indexOf('safari') !== -1;
	}
}

export function createFiresideController(
	fireside: Fireside,
	streamingAppId: string,
	streamingSessionId: string,
	onRetry: (() => void) | null = null
) {
	const c = new FiresideController(fireside, streamingAppId, streamingSessionId);
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

export async function publishFireside(c: FiresideController) {
	if (!c || !c.fireside || c.status !== 'joined' || !c.isDraft) {
		return;
	}

	await c.fireside.$publish();
	Growls.success(Translate.$gettext(`Your Fireside is live!`));
}

export async function extendFireside(c: FiresideController) {
	if (!c || c.status !== 'joined' || !c.canExtend || !c.fireside) {
		return;
	}

	const payload = await Api.sendRequest(
		`/web/dash/fireside/extend/${c.fireside.hash}`,
		{},
		{
			detach: true,
		}
	);
	if (payload.success && payload.extended) {
		c.fireside.expires_on = payload.expiresOn;
		updateFiresideExpiryValues(c);
	} else {
		Growls.info(
			Translate.$gettext(
				`Settle down there. Wait a couple seconds before playing with the fire again.`
			)
		);
	}
}

export function updateFiresideExpiryValues(c: FiresideController) {
	if (!c.fireside) {
		return;
	}

	c.totalDurationText = duration((Date.now() - c.fireside.added_on) / 1000);

	if (c.fireside.expires_on > Date.now()) {
		const expiresInS = c.fireside.getExpiryInMs() / 1000;

		c.hasExpiryWarning = expiresInS < FIRESIDE_EXPIRY_THRESHOLD;

		// Automatically extend for them if we're in a draft and get within 15
		// seconds of the expiry warning threshold.
		if (c.isDraft && !c._isExtending && expiresInS < FIRESIDE_EXPIRY_THRESHOLD + 15) {
			c._isExtending = true;
			extendFireside(c).finally(() => (c._isExtending = false));
		}

		if (expiresInS > FIRESIDE_EXPIRY_THRESHOLD) {
			c.expiresDurationText = null;
		} else {
			c.expiresDurationText = duration(expiresInS);
		}

		if (expiresInS > 300) {
			c.expiresProgressValue = null;
		} else {
			c.expiresProgressValue = (expiresInS / 300) * 100;
		}
	} else {
		c.expiresDurationText = null;
	}
}
