import {
	computed,
	inject,
	InjectionKey,
	markRaw,
	provide,
	reactive,
	ref,
	shallowReactive,
	watch,
} from 'vue';
import { Router } from 'vue-router';
import { arrayAssignAll, arrayUnique } from '../../../../utils/array';
import { getAbsoluteLink } from '../../../../utils/router';
import { getCurrentServerTime } from '../../../../utils/server-time';
import { Api } from '../../../../_common/api/api.service';
import {
	canCommunityEjectFireside,
	canCommunityFeatureFireside,
} from '../../../../_common/community/community.model';
import { configClientAllowStreaming } from '../../../../_common/config/config.service';
import { getDeviceBrowser } from '../../../../_common/device/device.service';
import { onFiresideStickerPlaced } from '../../../../_common/drawer/drawer-store';
import { formatDuration } from '../../../../_common/filters/duration';
import { Fireside, FIRESIDE_EXPIRY_THRESHOLD } from '../../../../_common/fireside/fireside.model';
import {
	cleanupFiresideRTCProducer,
	createFiresideRTCProducer,
	stopStreaming,
} from '../../../../_common/fireside/rtc/producer';
import {
	AgoraStreamingInfo,
	createFiresideRTC,
	destroyFiresideRTC,
	FiresideRTC,
	FiresideRTCHost,
	setHosts,
	setListableHostIds,
} from '../../../../_common/fireside/rtc/rtc';
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
	fireside = reactive(fireside) as Fireside;

	const agoraStreamingInfo = ref<AgoraStreamingInfo>();

	/**
	 * The hosts that are allowed to stream in the fireside.
	 */
	const hosts = ref([] as FiresideRTCHost[]);

	/**
	 * Which hosts the current user is able to list.
	 */
	const listableHostIds = ref([] as number[]);

	const stickerTargetController = createStickerTargetController(fireside, undefined, {
		isLive: true,
		placeStickerCallback: async data => {
			const roomChannel = chatChannel.value?.socketChannel;
			const targetUserId = rtc.value?.focusedUser?.userModel?.id;
			const errorResponse = { success: false };

			if (!roomChannel || !targetUserId) {
				// Tried placing a sticker while disconnected from chat or
				// without a focused user.
				return errorResponse;
			}

			const body = {} as any;
			for (const item in data) {
				if (Object.prototype.hasOwnProperty.call(data, item)) {
					const element = (data as any)[item];
					body[item.replace(/[A-Z]/, val => '_' + val.toLowerCase())] = element;
				}
			}
			body['host_user_id'] = targetUserId;

			return new Promise(resolve => {
				roomChannel
					.push(
						'place_sticker',
						body,
						// Just in case they get disconnected (or bad data
						// causes it to error out)
						5_000
					)
					.receive('ok', result => {
						const placement = result.stickerPlacement;
						if (placement) {
							onFiresideStickerPlaced.next(placement);
						}
						return resolve({ ...result, success: true });
					})
					.receive('error', () => resolve(errorResponse))
					.receive('timeout', () => {
						// Only show a timeout error if they're still connected
						// to the socket.
						if (chatChannel.value?.socketChannel) {
							resolve(errorResponse);
						}
					});
			});
		},
	});
	const isMuted = options.isMuted ?? false;

	const rtc = ref<FiresideRTC>();
	const status = ref<RouteStatus>('initial');
	const onRetry = ref<() => void>();

	const chat = ref<ChatClient>();

	const gridChannel = ref<FiresideChannel>();
	const gridDMChannel = ref<FiresideChannel>();
	const chatChannel = ref<ChatRoomChannel>();
	const expiryInterval = ref<NodeJS.Timer>();
	const chatPreviousConnectedState = ref<boolean>();
	const gridPreviousConnectedState = ref<boolean>();

	/**
	 * Visually shows a warning to the owner when the fireside's time is running
	 * low.
	 */
	const hasExpiryWarning = ref(false);

	const isShowingOverlayPopper = ref(false);
	const isShowingStreamSetup = ref(false);

	const updateInterval = ref<NodeJS.Timer>();
	const totalDurationText = ref<string>();
	const expiresDurationText = ref<string>();
	const expiresProgressValue = ref<number>();

	const isExtending = ref(false);

	const user = computed(() => commonStore.user.value);
	const chatRoom = computed(() => chatChannel.value?.room);

	const chatUsers = computed(() => {
		if (!chatRoom.value) {
			return undefined;
		}
		return chat.value?.roomMembers[chatRoom.value.id] as ChatUserCollection;
	});

	const isDraft = computed(() => fireside?.is_draft ?? true);
	const isStreaming = computed(() => !!rtc.value && rtc.value.listableStreamingUsers.length > 0);

	const isPersonallyStreaming = computed(() => rtc.value?.isPersonallyStreaming ?? false);

	const isStreamingElsewhere = computed(() => {
		if (!rtc.value?.userId) {
			return false;
		}

		const user = rtc.value.listableStreamingUsers.find(
			i => !i.isLocal && i.userModel?.id === rtc.value?.userId
		);
		if (!user) {
			return false;
		}

		// User is in the list of RTC users, but they are not streaming locally.
		return !isPersonallyStreaming.value;
	});

	const shouldShowStreamingOptions = computed(
		() => canStream.value || isPersonallyStreaming.value
	);

	const canStream = computed(() => {
		return (
			!!rtc.value?.producer &&
			!!(Screen.isDesktop || (user.value && user.value.permission_level >= 4))
		);
	});

	const isOwner = computed(() => !!user.value && user.value.id === fireside.user.id);
	const canManageCohosts = computed(
		() => isOwner.value || fireside.hasPerms('fireside-collaborators')
	);
	const canCommunityFeature = computed(
		() => !!fireside.community && canCommunityFeatureFireside(fireside.community)
	);
	const canCommunityEject = computed(
		() => !!fireside.community && canCommunityEjectFireside(fireside.community)
	);
	const canEdit = computed(() => isOwner.value || fireside.hasPerms('fireside-edit'));

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
			expiresProgressValue.value !== undefined &&
			expiresProgressValue.value <= 95 &&
			fireside.hasPerms('fireside-extend')
		);
	});

	const canExtinguish = computed(() => isOwner.value || fireside.hasPerms('fireside-extinguish'));
	const canReport = computed(
		() => !(fireside.hasPerms() || fireside.community?.hasPerms() === true)
	);

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

	const _browser = computed(() => getDeviceBrowser().toLowerCase());

	// Can't broadcast properly - incapable of selecting an output device
	const _isFirefox = computed(() => _browser.value.indexOf('firefox') !== -1);

	// Can't broadcast - incapable of dual streams
	const _isSafari = computed(() => _browser.value.indexOf('safari') !== -1);

	const _wantsRTC = computed(() => {
		console.log('recomputing wantsRTC');

		const myStatus = status.value;
		const agoraInfo = agoraStreamingInfo.value;
		const myHosts = hosts.value;
		const myRoleCanStream = fireside.role?.canStream;
		const myListableHostIds = listableHostIds.value;

		// Only initialize RTC when we are fully connected.
		if (myStatus !== 'joined') {
			console.log('status not joined');
			return false;
		}

		// We have to have valid looking agora streaming credentials.
		if (!agoraInfo || !agoraInfo.videoToken || !agoraInfo.chatToken) {
			console.log('agora streaming value sucks');
			return false;
		}

		// If we don't have hosts, we shouldnt initialize RTC.
		if (!myHosts || myHosts.length === 0) {
			console.log('no hosts gtfo');
			return false;
		}

		if (myRoleCanStream) {
			console.log('i can stream, so create rtc ahead of time');
			return true;
		}

		// A listable host must be streaming.
		console.log('checking listable host ids');
		return isListableHostStreaming(myHosts, myListableHostIds);
	});

	const _wantsRTCProducer = computed(() => {
		if (!rtc.value) {
			return false;
		}

		return !!fireside.role?.canStream;
	});

	const revalidateRTC = () => {
		console.debug('[FIRESIDE] wantsRTC changed to ' + (_wantsRTC.value ? 'true' : 'false'));

		if (_wantsRTC.value) {
			// Note: since revalidateRTC may be called outside of watcher flow,
			// we need to avoid recreating rtc if it already exists.
			rtc.value ??= createFiresideRTC(
				fireside,
				user.value?.id ?? null,
				agoraStreamingInfo.value!,
				hosts,
				listableHostIds,
				{ isMuted }
			);
		} else if (rtc.value) {
			console.debug('[FIRESIDE] Destroying old rtc');

			destroyFiresideRTC(rtc.value);

			// Note: this would trigger the wantsRTCProducer watcher, but it
			// won't actually run the cleanup since rtc.value got unset. It's a
			// bit of a meme, but the way the producer gets destroyed in this
			// case is through the destroyFiresideRTC above.
			//
			// TODO(big-pp-event) this way of destroying the producer will not
			// end up clearing recording devices. this is because it does not
			// call stopStreaming..
			rtc.value = undefined;
		} else {
			console.debug('[FIRESIDE] rtc was not set, nothing to do');
		}

		return rtc.value;
	};

	const _unwatchWantsRTC = watch(_wantsRTC, revalidateRTC);

	const _unwatchWantsRTCProducer = watch(_wantsRTCProducer, async newWantsRTCProducer => {
		console.debug(
			'[FIRESIDE] wantsRTCProducer changed to ' + (newWantsRTCProducer ? 'true' : 'false')
		);

		if (newWantsRTCProducer) {
			// Do not create the producer if it already exists.
			// This should never happen normally.
			rtc.value!.producer ??= markRaw(createFiresideRTCProducer(rtc.value!));
		} else if (rtc.value) {
			const prevProducer = rtc.value.producer;
			rtc.value.producer = null;

			if (prevProducer) {
				console.debug('[FIRESIDE] Tearing down old producer');
				// Ideally we'd like to not await here because we want the producer
				// to be considered "torn down" immediately. It simplifies logic for handling it.
				// We can't avoid awaiting here tho because if the producer instance
				// is in a busy state at the moment we want do dispose it, it'll queue up stopping
				// the streams, then cleanupFiresideRTCProducer gets called which sets _isStreaming
				// to false, and THEN when the streams actually attempt to stop it'd think they
				// already stopped, and will not run the teardown logic for them..
				await stopStreaming(prevProducer);
				// TODO(big-pp-event) is there a way to make absolutely sure nothing keeps a reference
				// to producer past this point? theres nothing in the producer class that prevents attempting
				// to start streaming from a cleanup-up instance of producer.
				cleanupFiresideRTCProducer(prevProducer);
			} else {
				console.debug('[FIRESIDE] rtc.producer was not set, nothing to do');
			}
		} else {
			console.debug('[FIRESIDE] rtc was not set, nothing to do');
		}
	});

	const _unwatchHostsChanged = watch(
		hosts,
		(newHosts, prevHosts) => {
			console.debug('[FIRESIDE] updating hosts in controller');

			// We want to merge the streaming uids of our existing hosts with the new ones.
			// Note: I'm not 100% sure why we want that. My guess is because we freeze the
			// streaming uid on the RTCUser instances, but we still want to match against the
			// same RTCHost with their new streaming uids?
			for (const newHost of newHosts) {
				const prevHost = prevHosts.find(i => i.user.id === newHost.user.id);
				if (prevHost) {
					console.debug(`[FIRESIDE] merging streaming uids of host ${newHost.user.id}`);

					// Transfer over all previously assigned uids to the new host.
					const newUids = arrayUnique([...prevHost.uids, ...newHost.uids]);
					arrayAssignAll(newHost.uids, newUids);
				}
			}

			console.debug('[FIRESIDE] new hosts after merging uids', JSON.stringify(newHosts));

			if (rtc.value) {
				console.debug('[FIRESIDE] updating hosts in rtc');
				setHosts(rtc.value, newHosts);
			}
		},
		{ deep: true }
	);

	const _unwatchListableHostIdsChanged = watch(
		listableHostIds,
		newListableHostIds => {
			if (rtc.value) {
				console.debug(
					'[FIRESIDE] setting listableHostIds',
					JSON.stringify(newListableHostIds)
				);
				setListableHostIds(rtc.value, newListableHostIds);
			}
		},
		{ deep: true }
	);

	const cleanup = async () => {
		console.debug('[FIRESIDE] controller cleanup called');

		// These watchers are used to figure out
		// when we need to destroy rtc and rtc producer. we want
		// to make sure these are still destroyed even if the watchers are disposed.
		_unwatchWantsRTC();
		_unwatchWantsRTCProducer();
		_unwatchHostsChanged();
		_unwatchListableHostIdsChanged();

		if (rtc.value) {
			// The code below should now be handled by destroyFiresideRTC.
			// Need to check this!!!

			// // I'm a bit hesitant to destroy the producer like this since technically
			// // destroyFiresideRTC should do it. Problem is it currently doesnt do it correctly..
			// // See comments on that function for more info.
			// if (rtc.value.producer) {
			// 	// We should be fine awaiting here because we don't care to immediately reuse
			// 	// the same rtc instance since the controller is being disposed.
			// 	// There might be an issue if we're trying to instantiate a new controller
			// 	// before stopStreaming finishes.
			// 	try {
			// 		await stopStreaming(rtc.value.producer);
			// 	} catch (e) {
			// 		console.error(
			// 			'Failed to stop streaming while destroying fireside controller',
			// 			e
			// 		);
			// 	}
			// }

			destroyFiresideRTC(rtc.value);
		}
	};

	return shallowReactive({
		fireside,
		agoraStreamingInfo,
		hosts,
		listableHostIds,
		stickerTargetController,
		isMuted,
		rtc,
		revalidateRTC,
		status,
		onRetry,
		chat,
		gridChannel,
		gridDMChannel,
		chatChannel,
		expiryInterval,
		chatPreviousConnectedState,
		gridPreviousConnectedState,
		hasExpiryWarning,
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
		cleanup,
	});
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
			c.expiresDurationText.value = undefined;
		} else {
			c.expiresDurationText.value = formatDuration(expiresInS);
		}

		if (expiresInS > 300) {
			c.expiresProgressValue.value = undefined;
		} else {
			c.expiresProgressValue.value = (expiresInS / 300) * 100;
		}
	} else {
		c.expiresDurationText.value = undefined;
	}
}

function isListableHostStreaming(hosts: FiresideRTCHost[], listableHostIds: number[]): boolean {
	return hosts.some(i => {
		if (!i.isLive) {
			return false;
		}

		if (!i.needsPermissionToView) {
			return true;
		}

		return listableHostIds?.includes(i.user.id);
	});
}
