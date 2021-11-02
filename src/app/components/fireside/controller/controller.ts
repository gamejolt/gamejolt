import VueRouter from 'vue-router';
import { getAbsoluteLink } from '../../../../utils/router';
import { getCurrentServerTime } from '../../../../utils/server-time';
import { Api } from '../../../../_common/api/api.service';
import {
	canCommunityEjectFireside,
	canCommunityFeatureFireside,
} from '../../../../_common/community/community.model';
import { Device } from '../../../../_common/device/device.service';
import { duration } from '../../../../_common/filters/duration';
import { Fireside, FIRESIDE_EXPIRY_THRESHOLD } from '../../../../_common/fireside/fireside.model';
import { FiresideRTC } from '../../../../_common/fireside/rtc/rtc';
import { Growls } from '../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../_common/share/share.service';
import { StickerTargetController } from '../../../../_common/sticker/target/target-controller';
import { appStore } from '../../../../_common/store/app-store';
import { Translate } from '../../../../_common/translate/translate.service';
import { ChatClient } from '../../chat/client';
import { ChatRoomChannel } from '../../chat/room-channel';
import { FiresideChannel } from '../../grid/fireside-channel';
import { FiresidePublishModal } from '../publish-modal/publish-modal.service';

export type RouteStatus =
	| 'initial' // Initial status when route loads.
	| 'disconnected' // Disconnected from the fireside (chat/client channels).
	| 'loading' // Initiated loading to connect to relevant channels.
	| 'unauthorized' // Cannot join because user is not logged in/has no cookie.
	| 'expired' // Fireside has expired.
	| 'setup-failed' // Failed to properly join the fireside.
	| 'joined' // Currently joined to the fireside.
	| 'blocked'; // Blocked from joining the fireside (user blocked).

export const FiresideControllerKey = Symbol('fireside-controller');

type Options = { isMuted?: boolean };

export class FiresideController {
	constructor(
		public readonly fireside: Fireside,
		public readonly stickerTargetController: StickerTargetController,
		{ isMuted }: Options
	) {
		this.isMuted = isMuted ?? false;
	}

	readonly isMuted;

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

	get isStreamingElsewhere() {
		if (!this.rtc || !this.rtc.userId) {
			return false;
		}

		const user = this.rtc.users.find(i => i.userModel?.id === this.rtc?.userId);
		if (!user) {
			return false;
		}

		// User is in the list of RTC users, but they are not streaming locally.
		return !this.isPersonallyStreaming;
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

	get isOwner() {
		return !!this.user && this.user.id === this.fireside.user.id;
	}

	get canManageCohosts() {
		return this.isOwner || this.fireside.hasPerms('fireside-collaborators');
	}

	get canCommunityFeature() {
		return !!this.fireside.community && canCommunityFeatureFireside(this.fireside.community);
	}

	get canCommunityEject() {
		return !!this.fireside.community && canCommunityEjectFireside(this.fireside.community);
	}

	get canEdit() {
		return this.isOwner || this.fireside.hasPerms('fireside-edit');
	}

	get canPublish() {
		const role = this.fireside.role?.role;
		return (
			(this.isOwner || role === 'host' || role === 'cohost') &&
			this.status === 'joined' &&
			this.isDraft
		);
	}

	get canExtend() {
		return (
			this.status === 'joined' &&
			this.expiresProgressValue !== null &&
			this.expiresProgressValue <= 95 &&
			this.fireside.hasPerms('fireside-extend')
		);
	}

	get canExtinguish() {
		return this.isOwner || this.fireside.hasPerms('fireside-extinguish');
	}

	get canReport() {
		return !(this.fireside.hasPerms() || this.fireside.community?.hasPerms() === true);
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
		return GJ_IS_CLIENT;
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

export function createFiresideController(fireside: Fireside, options: Options = {}) {
	return new FiresideController(
		fireside,
		new StickerTargetController(fireside, undefined, true),
		options
	);
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

export function toggleStreamVideoStats(c: FiresideController) {
	c.rtc!.shouldShowVideoStats = !(c.rtc?.shouldShowVideoStats ?? true);
}

export async function publishFireside(c: FiresideController) {
	if (!c.fireside || c.status !== 'joined' || !c.isDraft) {
		return;
	}

	const { fireside } = c;
	const ret = await FiresidePublishModal.show({ fireside });
	if (ret?.doPublish !== true) {
		return;
	}

	await c.fireside.$publish({ autoFeature: ret.autoFeature });
	Growls.success(Translate.$gettext(`Your fireside is live!`));
}

export async function extendFireside(c: FiresideController, growlOnFail = true) {
	if (c.status !== 'joined' || !c.canExtend || !c.fireside) {
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
	} else if (growlOnFail) {
		Growls.info(
			Translate.$gettext(
				`Settle down there. Wait a couple seconds before playing with the fire again.`
			)
		);
	}
}

export async function extinguishFireside(c: FiresideController) {
	if (!c.fireside || !c.canExtinguish) {
		return;
	}

	const result = await ModalConfirm.show(
		Translate.$gettext(
			`Are you sure you want to extinguish your Fireside? This will immediately close it and send all members home.`
		)
	);
	if (!result) {
		return;
	}

	await c.fireside.$extinguish();
}

export function updateFiresideExpiryValues(c: FiresideController) {
	if (!c.fireside) {
		return;
	}

	const now = getCurrentServerTime();

	c.totalDurationText = duration((now - c.fireside.added_on) / 1000);

	if (c.fireside.expires_on > now) {
		const expiresInS = c.fireside.getExpiryInMs() / 1000;

		c.hasExpiryWarning = expiresInS < FIRESIDE_EXPIRY_THRESHOLD;

		// Automatically extend for them if we're in a draft and get within 15
		// seconds of the expiry warning threshold.
		if (c.isDraft && !c._isExtending && expiresInS < FIRESIDE_EXPIRY_THRESHOLD + 15) {
			c._isExtending = true;
			// Don't show growls if this fails.
			extendFireside(c, false);
			// Wait 5 seconds before we allow auto-extending again.
			setTimeout(() => {
				c._isExtending = false;
			}, 5_000);
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
