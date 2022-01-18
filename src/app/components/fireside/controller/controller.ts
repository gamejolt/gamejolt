import { InjectionKey, provide } from '@vue/runtime-core';
import { computed, inject, ref, Ref, shallowReactive, shallowRef } from 'vue';
import { Router } from 'vue-router';
import { getAbsoluteLink } from '../../../../utils/router';
import { getCurrentServerTime } from '../../../../utils/server-time';
import { Api } from '../../../../_common/api/api.service';
import {
	canCommunityEjectFireside,
	canCommunityFeatureFireside,
} from '../../../../_common/community/community.model';
import { configClientAllowStreaming } from '../../../../_common/config/config.service';
import { getDeviceBrowser } from '../../../../_common/device/device.service';
import { formatDuration } from '../../../../_common/filters/duration';
import { Fireside, FIRESIDE_EXPIRY_THRESHOLD } from '../../../../_common/fireside/fireside.model';
import { FiresideRTC } from '../../../../_common/fireside/rtc/rtc';
import { showInfoGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../_common/share/share.service';
import { createStickerTargetController } from '../../../../_common/sticker/target/target-controller';
import { commonStore } from '../../../../_common/store/common-store';
import { Translate } from '../../../../_common/translate/translate.service';
import { ChatClient } from '../../chat/client';
import { ChatRoomChannel } from '../../chat/room-channel';
import { ChatUserCollection } from '../../chat/user-collection';
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

const FiresideControllerKey: InjectionKey<FiresideController> = Symbol('fireside-controller');
type Options = { isMuted?: boolean };

export type FiresideController = ReturnType<typeof createFiresideController>;

export function createFiresideController(fireside: Fireside, options: Options = {}) {
	const stickerTargetController = createStickerTargetController(fireside, undefined, true);
	const isMuted = options.isMuted ?? false;

	const rtc = shallowRef(null) as Ref<FiresideRTC | null>;
	const status = ref('initial') as Ref<RouteStatus>;
	const onRetry = ref(null) as Ref<(() => void) | null>;

	const chat = ref(null) as Ref<ChatClient | null>;

	const gridChannel = ref(null) as Ref<FiresideChannel | null>;
	const chatChannel = ref(null) as Ref<ChatRoomChannel | null>;
	const expiryInterval = ref(null) as Ref<NodeJS.Timer | null>;
	const chatPreviousConnectedState = ref(null) as Ref<boolean | null>;
	const gridPreviousConnectedState = ref(null) as Ref<boolean | null>;

	/**
	 * Visually shows a warning to the owner when the fireside's time is running
	 * low.
	 */
	const hasExpiryWarning = ref(false);

	const isShowingStreamOverlay = ref(false);
	const isShowingOverlayPopper = ref(false);
	const isShowingStreamSetup = ref(false);

	const updateInterval = ref(null) as Ref<NodeJS.Timer | null>;
	const totalDurationText = ref(null) as Ref<string | null>;
	const expiresDurationText = ref(null) as Ref<string | null>;
	const expiresProgressValue = ref(null) as Ref<number | null>;

	const isExtending = ref(false);

	const user = computed(() => {
		return commonStore.user.value;
	});

	const chatRoom = computed(() => {
		return chatChannel.value?.room;
	});

	const chatUsers = computed(() => {
		if (!chatRoom.value) {
			return undefined;
		}
		return chat.value?.roomMembers[chatRoom.value.id] as ChatUserCollection;
	});

	const isDraft = computed(() => {
		return fireside?.is_draft ?? true;
	});

	const isStreaming = computed(() => {
		return !!(fireside?.is_streaming && rtc.value && rtc.value.users.length > 0);
	});

	const isPersonallyStreaming = computed(() => {
		return rtc.value?.isStreaming ?? false;
	});

	const isStreamingElsewhere = computed(() => {
		if (!rtc.value || !rtc.value.userId) {
			return false;
		}

		const user = rtc.value.users.find(i => i.userModel?.id === rtc.value?.userId);
		if (!user) {
			return false;
		}

		// User is in the list of RTC users, but they are not streaming locally.
		return !isPersonallyStreaming.value;
	});

	const shouldShowStreamingOptions = computed(() => {
		return canStream.value || isPersonallyStreaming.value;
	});

	const canStream = computed(() => {
		return (
			!!rtc.value?.producer &&
			!!(Screen.isDesktop || (user.value && user.value.permission_level >= 4))
		);
	});

	const isOwner = computed(() => {
		return !!user.value && user.value.id === fireside.user.id;
	});

	const canManageCohosts = computed(() => {
		return isOwner.value || fireside.hasPerms('fireside-collaborators');
	});

	const canCommunityFeature = computed(() => {
		return !!fireside.community && canCommunityFeatureFireside(fireside.community);
	});

	const canCommunityEject = computed(() => {
		return !!fireside.community && canCommunityEjectFireside(fireside.community);
	});

	const canEdit = computed(() => {
		return isOwner.value || fireside.hasPerms('fireside-edit');
	});

	const canPublish = computed(() => {
		const role = fireside.role?.role;
		return (
			(isOwner.value || role === 'host' || role === 'cohost') &&
			status.value === 'joined' &&
			isDraft.value
		);
	});

	const canExtend = computed(() => {
		return (
			status.value === 'joined' &&
			expiresProgressValue.value !== null &&
			expiresProgressValue.value <= 95 &&
			fireside.hasPerms('fireside-extend')
		);
	});

	const canExtinguish = computed(() => {
		return isOwner.value || fireside.hasPerms('fireside-extinguish');
	});

	const canReport = computed(() => {
		return !(fireside.hasPerms() || fireside.community?.hasPerms() === true);
	});

	/**
	 * Contains a block-list of browsers/clients that can't broadcast.
	 *
	 * Should suggest known-working browser instead of displaying stream-setup
	 * form.
	 */
	const canBrowserStream = computed(() => {
		if (GJ_IS_DESKTOP_APP) {
			return configClientAllowStreaming.value;
		}

		return !(_isFirefox.value || _isSafari.value);
	});

	const _browser = computed(() => {
		return getDeviceBrowser().toLowerCase();
	});

	// Can't broadcast properly - incapable of selecting an output device
	const _isFirefox = computed(() => {
		return _browser.value.indexOf('firefox') !== -1;
	});

	// Can't broadcast - incapable of dual streams
	const _isSafari = computed(() => {
		return _browser.value.indexOf('safari') !== -1;
	});

	const c = shallowReactive({
		fireside,
		stickerTargetController,
		isMuted,
		rtc,
		status,
		onRetry,
		chat,
		gridChannel,
		chatChannel,
		expiryInterval,
		chatPreviousConnectedState,
		gridPreviousConnectedState,
		hasExpiryWarning,
		isShowingStreamOverlay,
		isShowingOverlayPopper,
		isShowingStreamSetup,
		updateInterval,
		totalDurationText,
		expiresDurationText,
		expiresProgressValue,
		isExtending,
		user,
		chatRoom,
		chatUsers,
		isDraft,
		isStreaming,
		isPersonallyStreaming,
		isStreamingElsewhere,
		shouldShowStreamingOptions,
		canStream,
		isOwner,
		canManageCohosts,
		canCommunityFeature,
		canCommunityEject,
		canEdit,
		canPublish,
		canExtend,
		canExtinguish,
		canReport,
		canBrowserStream,
		// _browser,
		// _isFirefox,
		// _isSafari,
	});

	return c;
}

export function useFiresideController() {
	return inject(FiresideControllerKey) || null;
}

export function provideFiresideController(c?: FiresideController | null) {
	provide(FiresideControllerKey, c);
}

export function getFiresideLink(c: FiresideController, router: Router) {
	if (!c.fireside) {
		return;
	}
	return getAbsoluteLink(router, c.fireside.location);
}

export function copyFiresideLink(c: FiresideController, router: Router) {
	const url = getFiresideLink(c, router);
	if (url) {
		copyShareLink(url, 'fireside');
	}
}

export function toggleStreamVideoStats(c: FiresideController) {
	if (!c.rtc.value) {
		return;
	}
	c.rtc.value.shouldShowVideoStats = !c.rtc.value.shouldShowVideoStats;
}

export async function publishFireside(c: FiresideController) {
	if (!c.fireside || c.status.value !== 'joined' || !c.isDraft.value) {
		return;
	}

	const { fireside } = c;
	const ret = await FiresidePublishModal.show({ fireside });
	if (ret?.doPublish !== true) {
		return;
	}

	await c.fireside.$publish({ autoFeature: ret.autoFeature });
	showSuccessGrowl(Translate.$gettext(`Your fireside is live!`));
}

export async function extendFireside(c: FiresideController, growlOnFail = true) {
	if (c.status.value !== 'joined' || !c.canExtend.value || !c.fireside) {
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
		showInfoGrowl(
			Translate.$gettext(
				`Settle down there. Wait a couple seconds before playing with the fire again.`
			)
		);
	}
}

export async function extinguishFireside(c: FiresideController) {
	if (!c.fireside || !c.canExtinguish.value) {
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

	c.totalDurationText.value = formatDuration((now - c.fireside.added_on) / 1000);

	if (c.fireside.expires_on > now) {
		const expiresInS = c.fireside.getExpiryInMs() / 1000;

		c.hasExpiryWarning.value = expiresInS < FIRESIDE_EXPIRY_THRESHOLD;

		// Automatically extend for them if we're in a draft and get within 15
		// seconds of the expiry warning threshold.
		if (
			c.isDraft.value &&
			!c.isExtending.value &&
			expiresInS < FIRESIDE_EXPIRY_THRESHOLD + 15
		) {
			c.isExtending.value = true;
			// Don't show growls if this fails.
			extendFireside(c, false);
			// Wait 5 seconds before we allow auto-extending again.
			setTimeout(() => {
				c.isExtending.value = false;
			}, 5_000);
		}

		if (expiresInS > FIRESIDE_EXPIRY_THRESHOLD) {
			c.expiresDurationText.value = null;
		} else {
			c.expiresDurationText.value = formatDuration(expiresInS);
		}

		if (expiresInS > 300) {
			c.expiresProgressValue.value = null;
		} else {
			c.expiresProgressValue.value = (expiresInS / 300) * 100;
		}
	} else {
		c.expiresDurationText.value = null;
	}
}
