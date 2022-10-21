import {
	computed,
	customRef,
	inject,
	InjectionKey,
	markRaw,
	provide,
	reactive,
	readonly,
	Ref,
	ref,
	shallowReadonly,
	shallowRef,
	toRaw,
	unref,
	watch,
} from 'vue';
import { Router } from 'vue-router';
import { arrayAssignAll, arrayUnique } from '../../../../utils/array';
import { createLogger } from '../../../../utils/logging';
import { objectPick } from '../../../../utils/object';
import { getAbsoluteLink } from '../../../../utils/router';
import { getCurrentServerTime, updateServerTimeOffset } from '../../../../utils/server-time';
import { run, sleep } from '../../../../utils/utils';
import { uuidv4 } from '../../../../utils/uuid';
import { MaybeRef } from '../../../../utils/vue';
import {
	trackFiresideExtinguish,
	trackFiresidePublish,
	trackFiresideSidebarButton,
	trackFiresideSidebarCollapse,
} from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { Background } from '../../../../_common/background/background.model';
import {
	canCommunityEjectFireside,
	canCommunityFeatureFireside,
} from '../../../../_common/community/community.model';
import { ContentFocus } from '../../../../_common/content-focus/content-focus.service';
import { getDeviceBrowser, getDeviceOS } from '../../../../_common/device/device.service';
import { DogtagData } from '../../../../_common/dogtag/dogtag-data';
import { formatDuration } from '../../../../_common/filters/duration';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { FiresideChatSettings } from '../../../../_common/fireside/chat/chat-settings.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresideRole } from '../../../../_common/fireside/role/role.model';
import {
	cleanupFiresideRTCProducer,
	createFiresideRTCProducer,
	stopStreaming,
} from '../../../../_common/fireside/rtc/producer';
import {
	AgoraStreamingInfo,
	applyAudienceRTCTokens,
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
import { onFiresideStickerPlaced, StickerStore } from '../../../../_common/sticker/sticker-store';
import { createStickerTargetController } from '../../../../_common/sticker/target/target-controller';
import { CommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import { BottomBarControl } from '../../../views/fireside/_bottom-bar/AppFiresideBottomBar.vue';
import { leaveChatRoom } from '../../chat/client';
import { ChatRoomChannel, createChatRoomChannel } from '../../chat/room-channel';
import { ChatUserCollection } from '../../chat/user-collection';
import { createGridFiresideChannel, GridFiresideChannel } from '../../grid/fireside-channel';
import { createGridFiresideDMChannel, GridFiresideDMChannel } from '../../grid/fireside-dm-channel';
import { GridStore } from '../../grid/grid-store';

/**
 * Should we show the app promo, because it will be better on their device?
 * Note, it's a computed ref so that it calls getDeviceOS only when needed.
 */
export const shouldPromoteAppForStreaming = computed(
	() => !GJ_IS_DESKTOP_APP && getDeviceOS() === 'windows'
);

export type RouteStatus =
	| 'initial' // Initial status when route loads.
	| 'disconnected' // Disconnected from the fireside (chat/client channels).
	| 'loading' // Initiated loading to connect to relevant channels.
	| 'unauthorized' // Cannot join because user is not logged in/has no cookie.
	| 'expired' // Fireside has expired.
	| 'setup-failed' // Failed to properly join the fireside.
	| 'joined' // Currently joined to the fireside.
	| 'blocked'; // Blocked from joining the fireside (user blocked).

export type FiresideSidebar =
	| 'chat'
	| 'members'
	| 'hosts'
	| 'fireside-settings'
	| 'stream-settings';

export interface StreamingInfoPayload {
	streamingAppId: string;
	videoChannelName: string;
	videoToken: string;
	chatChannelName: string;
	chatToken: string;
	hosts?: unknown[];
	unlistedHosts?: unknown[];
	streamingHostIds?: number[];
	streamingUid?: number;
	streamingUids?: Record<number, number[]>;
}

interface FetchedUserData {
	is_following: boolean;
	dogtags: DogtagData[];
}

/**
 * What's returned in the fetch-for-streaming payload.
 */
interface FullStreamingPayload extends StreamingInfoPayload {
	streamingUid: number;
	fireside: unknown;
	serverTime: number;
	listableHostIds?: number[];
}

const FiresideControllerKey: InjectionKey<FiresideController> = Symbol('fireside-controller');
export type FiresideController = ReturnType<typeof createFiresideController>;

export function createFiresideController(
	fireside: Fireside,
	options: {
		isMuted?: boolean;
		commonStore: CommonStore;
		stickerStore: StickerStore;
		gridStore: GridStore;
		router: Router;
	}
) {
	const { isMuted = false, commonStore, gridStore, stickerStore, router } = options;
	const { user } = commonStore;
	const { grid, loadGrid } = gridStore;

	const logger = createLogger('Fireside');

	fireside = reactive(fireside) as Fireside;

	const agoraStreamingInfo = ref<AgoraStreamingInfo>();

	/**
	 * The hosts that are allowed to stream in the fireside.
	 */
	const hosts = ref([]) as Ref<FiresideRTCHost[]>;

	/**
	 * Map of userId and data that we specifically requested to supplement
	 * models from grid notifications.
	 *
	 * The result of this Map should be used to assign to the User model anytime
	 * we get a new model.
	 */
	const fetchedHostUserData = new Map<number, FetchedUserData>();

	/**
	 * Which hosts the current user is able to list.
	 */
	const listableHostIds = ref(new Set<number>());

	/**
	 * Mapping of user id to the background they have selected. Gets updated
	 * through events over {@link GridFiresideChannel}.
	 */
	const hostBackgrounds = ref(new Map<number, Background>());

	const stickerTargetController = createStickerTargetController(fireside, {
		isLive: true,
		isCreator: computed(() => {
			const user = rtc.value?.focusedUser?.userModel;
			if (!user) {
				return false;
			}
			return user.is_creator === true;
		}),
		placeStickerCallback: async data => {
			const roomChannel = chatChannel.value;
			const targetUserId = rtc.value?.focusedUser?.userModel?.id;
			const errorResponse = { success: false };

			if (!roomChannel || !targetUserId) {
				// Tried placing a sticker while disconnected from chat or
				// without a focused user.
				return errorResponse;
			}

			const stickerData = {} as any;
			for (const item in data) {
				if (Object.prototype.hasOwnProperty.call(data, item)) {
					const element = (data as any)[item];
					stickerData[item.replace(/[A-Z]/, val => '_' + val.toLowerCase())] = element;
				}
			}

			const result = await roomChannel.pushPlaceSticker(targetUserId, stickerData);

			const placement = result.stickerPlacement;
			if (placement) {
				onFiresideStickerPlaced.next(placement);
			}
			return { ...result, success: true };
		},
	});

	const chatSettings = ref(new FiresideChatSettings()) as Ref<FiresideChatSettings>;
	const rtc = ref<FiresideRTC>();
	const status = ref<RouteStatus>('initial');

	const gridChannel = shallowRef<GridFiresideChannel>();
	const gridDMChannel = shallowRef<GridFiresideDMChannel>();
	const chatChannel = shallowRef<ChatRoomChannel>();
	let _expiryInterval: NodeJS.Timer | undefined;
	let _gridPreviousConnectedState: boolean | undefined = undefined;

	const isHoveringOverlayControl = ref(false);
	const shownUserCardHover = ref<number>();
	const isShowingStreamSetup = ref(false);

	let _updateInterval: NodeJS.Timer | undefined;
	const expiresDurationText = ref<string>();
	const expiresProgressValue = ref<number>();

	const _isExtending = ref(false);

	const focusedUser = computed(() => rtc.value?.focusedUser);

	const chat = computed(() => grid.value?.chat ?? undefined);
	const chatRoom = computed(() => chatChannel.value?.room.value);

	const chatUsers = computed(() => {
		if (!chatRoom.value) {
			return undefined;
		}
		return chat.value?.roomMembers[chatRoom.value.id] as ChatUserCollection;
	});

	const stickerCount = computed(() => {
		// StickerTargetController adds/removes from the list of stickers all
		// the time when in a Live context. Just get the counts from the model
		// directly.
		const length = stickerTargetController.model.sticker_counts.reduce(
			(prev, current) => prev + current.count,
			0
		);

		if (!length) {
			return undefined;
		}
		return formatFuzzynumber(length).toString();
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
		if (isOwner.value || role === 'host') {
			return status.value === 'joined' && isDraft.value;
		}

		return false;
	});

	const _canExtend = computed(() => {
		return (
			status.value === 'joined' &&
			expiresProgressValue.value !== undefined &&
			expiresProgressValue.value <= 95 &&
			fireside.hasPerms('fireside-extend')
		);
	});

	const canExtinguish = computed(() => isOwner.value || fireside.hasPerms('fireside-extinguish'));
	const canReport = computed(() => !!user.value && !isOwner.value);

	/**
	 * Contains a block-list of browsers/clients that can't broadcast.
	 *
	 * Should suggest known-working browser instead of displaying stream-setup
	 * form.
	 */
	const canBrowserStream = computed(() => {
		if (GJ_IS_DESKTOP_APP) {
			return true;
		}

		// Firefox and Safari each have problems with streaming. See their
		// comments for reasons.
		const shouldBlockFirefox = _isFirefox.value && user.value?.isMod !== true;
		if (shouldBlockFirefox || _isSafari.value) {
			return false;
		}

		return true;
	});

	/**
	 * Some browsers don't allow us to select output devices. If we're allowing
	 * them to stream, we can check this to know if we should show a tooltip or
	 * hide some form controls.
	 */
	const canBrowserSelectSpeakers = computed(() => {
		if (_isFirefox.value) {
			return false;
		}

		return true;
	});

	/**
	 * The background we would like to show currently in the fireside. It
	 * changes depending on who you are viewing.
	 */
	const background = computed(() => {
		// If we have no focused user, we want to try to use the background of the
		// logged in user, since they might be setting up their stream at the
		// moment before anyone else is streaming.
		if (!focusedUser.value) {
			const loggedUserId = user.value?.id;
			// Check host backgrounds through the RTC instead of the locally
			// defined values. This should prevent the background from showing
			// if the user was removed as a host but they still had a background
			// set.
			return loggedUserId ? rtc.value?.hostBackgrounds.get(loggedUserId) : undefined;
		}

		return focusedUser.value.background;
	});

	const shouldShowDesktopAppPromo = ref(shouldPromoteAppForStreaming.value);

	/**
	 * If we should hide the stream preview in the stream setup form.
	 */
	const shouldHideStreamVideoPreview = computed(() => {
		// Never hide if we have the stream "pinned".
		if (pinStreamVideo.value) {
			return false;
		}

		return !ContentFocus.isWindowFocused;
	});

	/**
	 * If we should hide the focused video stream.
	 */
	const shouldHideStreamVideo = computed(() => {
		// Never hide if we have the stream "pinned".
		if (pinStreamVideo.value) {
			return false;
		}

		// Always show if the window is focused, we paused the video streams
		// manually, or we're not streaming.
		if (
			ContentFocus.isWindowFocused ||
			rtc.value?.videoPaused === true ||
			!isPersonallyStreaming.value
		) {
			return false;
		}

		// Only hide if we're focusing our own stream.
		return focusedUser.value?.isLocal === true;
	});

	/**
	 * Used to override {@link shouldHideStreamVideo} and
	 * {@link shouldHideStreamVideoPreview}.
	 */
	const pinStreamVideo = ref(false);

	const _browser = computed(() => getDeviceBrowser().toLowerCase());

	/**
	 * Can't broadcast properly - incapable of selecting an output device.
	 */
	const _isFirefox = computed(() => _browser.value.indexOf('firefox') !== -1);

	/**
	 * Can't broadcast - incapable of dual streams.
	 */
	const _isSafari = computed(() => _browser.value.indexOf('safari') !== -1);

	const _wantsRTC = computed(() => {
		logger.info('recomputing wantsRTC');

		const myStatus = status.value;
		const agoraInfo = agoraStreamingInfo.value;
		const myHosts = hosts.value;
		const myRoleCanStream = fireside.role?.canStream;
		const myListableHostIds = listableHostIds.value;

		// Only initialize RTC when we are fully connected.
		if (myStatus !== 'joined') {
			logger.info('status not joined');
			return false;
		}

		// We have to have valid looking agora streaming credentials.
		if (!agoraInfo || !agoraInfo.videoToken || !agoraInfo.chatToken) {
			logger.info('agora streaming value sucks');
			return false;
		}

		// If we don't have hosts, we shouldnt initialize RTC.
		if (!myHosts || myHosts.length === 0) {
			logger.info('no hosts gtfo');
			return false;
		}

		if (myRoleCanStream) {
			logger.info('i can stream, so create rtc ahead of time');
			return true;
		}

		// A listable host must be streaming.
		logger.info('checking listable host ids');
		return isListableHostStreaming(myHosts, myListableHostIds);
	});

	const _wantsRTCProducer = computed(() => {
		if (!rtc.value) {
			return false;
		}

		return !!fireside.role?.canStream;
	});

	const revalidateRTC = () => {
		logger.debug('wantsRTC changed to ' + (_wantsRTC.value ? 'true' : 'false'));

		if (_wantsRTC.value) {
			// Note: since revalidateRTC may be called outside of watcher flow,
			// we need to avoid recreating rtc if it already exists.
			rtc.value ??= createFiresideRTC(
				fireside,
				user.value?.id ?? null,
				agoraStreamingInfo.value!,
				hosts,
				listableHostIds,
				hostBackgrounds,
				{ isMuted }
			);
		} else if (rtc.value) {
			logger.debug('Destroying old rtc');

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
			logger.debug('rtc was not set, nothing to do');
		}

		return rtc.value;
	};

	function _onChatUsersChanged() {
		// Assign our fireside host data anytime our chat users change from
		// unset to set.
		chatUsers.value?.assignFiresideHostData(hosts.value);
	}

	function assignHostBackgroundData(userId: number, background: Background | undefined) {
		if (!background) {
			hostBackgrounds.value.delete(userId);
		} else {
			hostBackgrounds.value.set(userId, background);
		}
	}

	const _unwatchChatUsers = watch(chatUsers, _onChatUsersChanged);

	const _unwatchWantsRTC = watch(_wantsRTC, revalidateRTC);

	const _unwatchWantsRTCProducer = watch(_wantsRTCProducer, async newWantsRTCProducer => {
		logger.debug('wantsRTCProducer changed to ' + (newWantsRTCProducer ? 'true' : 'false'));

		if (newWantsRTCProducer) {
			// Do not create the producer if it already exists.
			// This should never happen normally.
			rtc.value!.producer ??= markRaw(createFiresideRTCProducer(rtc.value!));
		} else if (rtc.value) {
			const prevProducer = rtc.value.producer;
			rtc.value.producer = null;

			if (prevProducer) {
				logger.debug('Tearing down old producer');
				// Ideally we'd like to not await here because we want the producer
				// to be considered "torn down" immediately. It simplifies logic for handling it.
				// We can't avoid awaiting here tho because if the producer instance
				// is in a busy state at the moment we want do dispose it, it'll queue up stopping
				// the streams, then cleanupFiresideRTCProducer gets called which sets _isStreaming
				// to false, and THEN when the streams actually attempt to stop it'd think they
				// already stopped, and will not run the teardown logic for them..
				await stopStreaming(prevProducer, 'auto-lost-perms');
				// TODO(big-pp-event) is there a way to make absolutely sure nothing keeps a reference
				// to producer past this point? theres nothing in the producer class that prevents attempting
				// to start streaming from a cleanup-up instance of producer.
				cleanupFiresideRTCProducer(prevProducer);
			} else {
				logger.debug('rtc.producer was not set, nothing to do');
			}
		} else {
			logger.debug('rtc was not set, nothing to do');
		}
	});

	const _unwatchHostsChanged = watch(
		hosts,
		(newHosts, prevHosts) => {
			logger.debug('updating hosts in controller');

			// We want to merge the streaming uids of our existing hosts with the new ones.
			// Note: I'm not 100% sure why we want that. My guess is because we freeze the
			// streaming uid on the RTCUser instances, but we still want to match against the
			// same RTCHost with their new streaming uids?
			for (const newHost of newHosts) {
				const prevHost = prevHosts.find(i => i.user.id === newHost.user.id);
				if (prevHost) {
					logger.debug(`merging streaming uids of host ${newHost.user.id}`);

					// Transfer over all previously assigned uids to the new host.
					const newUids = arrayUnique([...prevHost.uids, ...newHost.uids]);
					arrayAssignAll(newHost.uids, newUids);
				}
			}

			logger.debug('new hosts after merging uids', JSON.stringify(newHosts));

			if (rtc.value) {
				logger.debug('updating hosts in rtc');
				setHosts(rtc.value, newHosts);
			}
		},
		{ deep: true }
	);

	const _unwatchListableHostIdsChanged = watch(
		listableHostIds,
		newListableHostIds => {
			if (rtc.value) {
				logger.debug('setting listableHostIds', JSON.stringify(newListableHostIds));
				setListableHostIds(rtc.value, newListableHostIds);
			}
		},
		{ deep: true }
	);

	// Set up watchers to initiate connection once grid boots up. When a
	// connection is dropped or any other error on the socket we immediately
	// become disconnected and then queue up for restarting.
	const _unwatchGridConnection = watch(
		() => grid.value?.connected,
		() => _watchGrid
	);

	const sidebarHome: FiresideSidebar = 'chat';
	const _sidebar = ref<FiresideSidebar>(sidebarHome);
	const sidebar = readonly(computed(() => _sidebar.value));

	function setSidebar(current: FiresideSidebar, trigger: string) {
		if (current === sidebar.value) {
			return;
		}

		trackFiresideSidebarButton({
			previous: sidebar.value,
			current,
			trigger,
		});

		_sidebar.value = current;

		if (current !== sidebarHome && _collapseSidebar) {
			collapseSidebar.value = false;
			trackFiresideSidebarCollapse(false, 'new-sidebar');
		}
	}

	/**
	 * Removes a sidebar from the
	 */
	function popSidebar() {
		if (isSidebarHome.value) {
			return;
		}

		const previous = sidebar.value;
		_sidebar.value = sidebarHome;

		trackFiresideSidebarButton({
			previous,
			current: sidebarHome,
			trigger: 'go-back',
		});
	}

	const isSidebarHome = computed(() => sidebar.value === sidebarHome);

	let _collapseSidebar = false;
	const collapseSidebar = customRef<boolean>((track, trigger) => ({
		get: () => {
			track();
			return _collapseSidebar;
		},
		set: val => {
			if (val === _collapseSidebar) {
				return;
			}

			_collapseSidebar = val;
			if (val) {
				_sidebar.value = sidebarHome;
			}
			trigger();
		},
	}));

	const _unwatchSidebar = watch(
		() => [sidebar, collapseSidebar],
		() => {
			const collapse = collapseSidebar.value;
			const isHome = isSidebarHome.value;

			if (collapse === isHome) {
				return;
			}

			if (!isHome) {
				collapseSidebar.value = false;
			} else if (collapse) {
				_sidebar.value = sidebarHome;
			}
		}
	);

	const _isFullscreen = ref(false);
	const _fullscreenableElement = ref<HTMLElement | null>(null);

	/**
	 * Assigns the element that we want to be fullscreen-able. Only fullscreens
	 * the element if we had a different element fullscreen'd.
	 */
	const setFullscreenableElement = (target: MaybeRef<HTMLElement | undefined | null>) => {
		const element = toRaw(unref(target)) || null;

		if (_isFullscreen.value && element && element !== toRaw(_fullscreenableElement.value)) {
			toggleFullscreen(false);
			_fullscreenableElement.value = element;
			toggleFullscreen(true);
		} else {
			_fullscreenableElement.value = element;
		}
	};

	/**
	 * Toggles fullscreen on our {@link _fullscreenableElement}. Force-closes
	 * any fullscreen element if {@link setFullscreenableElement} wasn't called
	 * previously.
	 */
	const toggleFullscreen = (wantsFullscreen?: boolean) => {
		const element = _fullscreenableElement.value;

		const shouldFullscreen = wantsFullscreen ?? !_isFullscreen.value;
		const checkIsFullscreen = () => document.fullscreenElement === element;

		if (!element || !shouldFullscreen) {
			if (document.fullscreenElement) {
				document.exitFullscreen();
			}
			_isFullscreen.value = false;
			return;
		}

		const cb = () => {
			const current = document.fullscreenElement;
			if (!current || !checkIsFullscreen()) {
				_isFullscreen.value = false;
				element.removeEventListener('fullscreenchange', cb);
				return;
			}

			_isFullscreen.value = true;
		};

		element.addEventListener('fullscreenchange', cb, { passive: true });
		element.requestFullscreen();
	};

	const activeBottomBarControl = computed<BottomBarControl | undefined>(() => {
		switch (sidebar.value) {
			case 'hosts':
				return 'manage-cohosts';

			case 'fireside-settings':
				return 'settings';

			case 'stream-settings':
				return 'setup';

			default:
				return undefined;
		}
	});

	const isShowingStreamOverlay = ref(false);

	// We need the controller in our init flow, so create it now.
	const controller = shallowReadonly({
		fireside,
		agoraStreamingInfo,
		hosts,
		fetchedHostUserData,
		listableHostIds,
		hostBackgrounds,
		stickerTargetController,
		isMuted,
		rtc,
		revalidateRTC,
		assignHostBackgroundData,
		status,
		focusedUser,
		chat,
		chatSettings,
		gridChannel,
		gridDMChannel,
		chatChannel,
		isHoveringOverlayControl,
		shownUserCardHover,
		isShowingStreamSetup,
		updateInterval: _updateInterval,
		expiresDurationText,
		expiresProgressValue,
		user,
		chatRoom,
		chatUsers,
		stickerCount,
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
		canExtinguish,
		canReport,
		canBrowserStream,
		canBrowserSelectSpeakers,
		background,
		shouldShowDesktopAppPromo,
		shouldHideStreamVideoPreview,
		shouldHideStreamVideo,
		pinStreamVideo,
		logger,

		_isExtending,
		_canExtend,

		checkExpiry,
		cleanup,
		retry,

		isFullscreen: computed(() => _isFullscreen.value),
		canFullscreen: computed(() => _isFullscreen.value || !!_fullscreenableElement.value),
		setFullscreenableElement,
		toggleFullscreen,

		activeBottomBarControl,
		sidebar,
		setSidebar,
		popSidebar,
		sidebarHome,
		isSidebarHome,
		isShowingStreamOverlay,
		collapseSidebar,
		popperTeleportId: computed(() => `fireside-teleport-${fireside.id}`),
	});

	// Let's set ourselves up now!
	_init();

	async function _init() {
		if (fireside.blocked) {
			status.value = 'blocked';
			logger.debug(`Blocked from joining blocked user's fireside.`);
			return;
		}

		if (!grid.value) {
			loadGrid();
		}

		// Grid may already be connected (watchers wouldn't fire), so try
		// joining manually now.
		_tryJoin();
	}

	function _watchGrid() {
		logger.debug(
			'grid.connected watcher triggered: ' +
				(grid.value?.connected ? 'connected' : 'disconnected')
		);

		if (grid.value?.connected) {
			_tryJoin();
		}
		// Only disconnect when not connected and it previous registered a
		// different state. This watcher runs once initially when grid is not
		// connected, and we don't want to call disconnect in that case.
		else if (grid.value && _gridPreviousConnectedState !== undefined) {
			_disconnect();
		}

		_gridPreviousConnectedState = grid.value?.connected ?? undefined;
	}

	async function _tryJoin() {
		// Only try to join when disconnected (or for the first "initial" load).
		if (status.value !== 'disconnected' && status.value !== 'initial') {
			return;
		}

		status.value = 'loading';

		// Make sure the services are connected.
		while (!grid.value?.connected) {
			logger.debug('Wait for Grid...');

			if (grid.value && !user.value && !grid.value.isGuest) {
				logger.info('Enabling guest access to grid');
				const authToken = _getGuestToken();
				if (!authToken) {
					throw new Error('Could not fetch guest token. This should be impossible');
				}
				await grid.value.setGuestToken(authToken);
			}

			await sleep(250);
		}

		_join();
	}

	async function _join() {
		logger.debug(`Joining fireside.`);

		// --- Make sure common join conditions are met.

		if (!fireside || !grid.value || !grid.value.connected || !chat.value) {
			logger.debug(`General connection error.`);
			status.value = 'setup-failed';
			return;
		}

		// --- Refetch fireside information and check that it's not yet expired.

		const canProceed = await _fetchForFiresideStreaming(controller, {
			assignStatus: true,
		});
		if (!canProceed) {
			return;
		}

		// Maybe they are blocked now?
		if (fireside.blocked) {
			status.value = 'blocked';
			logger.debug(`Blocked from joining blocked user's fireside.`);
			return;
		}

		// Make sure it's still joinable.
		if (!fireside.isOpen()) {
			logger.debug(`Fireside is expired, and cannot be joined.`);
			status.value = 'expired';
			return;
		}

		// --- Make them join the fireside (if they aren't already).

		if (user.value && !fireside.role) {
			const rolePayload = await Api.sendRequest(`/web/fireside/join/${fireside.hash}`);
			if (!rolePayload || !rolePayload.success || !rolePayload.role) {
				logger.debug(`Failed to acquire a role.`);
				status.value = 'setup-failed';
				return;
			}
			fireside.role = new FiresideRole(rolePayload.role);
		}

		// --- Join channels.

		try {
			await Promise.all([
				run(async () => {
					logger.info('Trying to connect to fireside channel.');

					const newChannel = await createGridFiresideChannel(grid.value!, controller, {
						firesideHash: fireside.hash,
						stickerStore,
					});

					gridChannel.value = newChannel;
					grid.value!.firesideChannels.push(markRaw(newChannel));

					logger.info('Connected to fireside channel.');
				}),

				run(async () => {
					// Don't do this if viewing fireside as a guest.
					if (!user.value) {
						return;
					}

					logger.info('Trying to connect to fireside DM channel.');

					const newChannel = await createGridFiresideDMChannel(grid.value!, controller, {
						firesideHash: fireside.hash,
						user: user.value,
					});

					gridDMChannel.value = newChannel;
					grid.value!.firesideDMChannels.push(markRaw(newChannel));

					logger.info('Connected to fireside DM channel.');
				}),

				run(async () => {
					logger.info('Trying to connect to chat room.');

					const roomId = fireside.chat_room_id;

					const newChannel = await createChatRoomChannel(chat.value!, {
						roomId,
						instanced: true,
						afterMemberKick: data => {
							if (user.value && data.user_id === user.value.id) {
								showInfoGrowl($gettext(`You've been kicked from the fireside.`));
								router.push({ name: 'home' });
							}
						},
					});

					chatChannel.value = newChannel;

					logger.info('Connected to chat room.');
				}),
			]);
		} catch (error: any) {
			logger.warn(`Setup failure 4.`, error);

			if (error?.reason === 'blocked') {
				status.value = 'blocked';
			} else {
				status.value = 'setup-failed';
			}
			return;
		}

		status.value = 'joined';
		logger.debug(`Successfully joined fireside.`);

		// Set up the expiry interval to check if the fireside is expired.
		_clearExpiryCheck();
		_expiryInterval = setInterval(checkExpiry, 1000);
		checkExpiry();

		_setupExpiryInfoInterval();
		updateFiresideExpiryValues(controller);
	}

	function _disconnect() {
		if (status.value === 'disconnected') {
			return;
		}

		logger.debug(`Disconnecting from fireside.`);
		status.value = 'disconnected';

		_clearExpiryCheck();
		_destroyExpiryInfoInterval();

		if (grid.value?.connected) {
			if (gridChannel.value || gridDMChannel.value) {
				grid.value.leaveFireside(fireside);
			}
			gridChannel.value = undefined;
			gridDMChannel.value = undefined;

			if (chat.value && chatChannel.value) {
				leaveChatRoom(chat.value, chatChannel.value.room.value);
			}
			chatChannel.value = undefined;
		}

		logger.debug(`Disconnected from fireside.`);
	}

	function _clearExpiryCheck() {
		if (_expiryInterval) {
			clearInterval(_expiryInterval);
			_expiryInterval = undefined;
		}
	}

	function checkExpiry() {
		if (status.value !== 'joined' || !fireside) {
			return;
		}

		if (!fireside.isOpen()) {
			_disconnect();
			status.value = 'expired';
		}
	}

	function _destroyExpiryInfoInterval() {
		if (_updateInterval) {
			clearInterval(_updateInterval);
			_updateInterval = undefined;
		}
	}

	function _setupExpiryInfoInterval() {
		_destroyExpiryInfoInterval();
		_updateInterval = setInterval(() => updateFiresideExpiryValues(controller), 1000);
	}

	/**
	 * Cleanup should be called when you no longer want the controller. It
	 * shouldn't be used to disconnect.
	 */
	async function cleanup() {
		logger.debug('controller cleanup called');

		stickerStore.streak.value = null;

		_disconnect();
		grid.value?.unsetGuestToken();

		// These watchers are used to figure out
		// when we need to destroy rtc and rtc producer. we want
		// to make sure these are still destroyed even if the watchers are disposed.
		_unwatchChatUsers();
		_unwatchWantsRTC();
		_unwatchWantsRTCProducer();
		_unwatchHostsChanged();
		_unwatchListableHostIdsChanged();
		_unwatchGridConnection();
		_unwatchSidebar();

		if (rtc.value) {
			destroyFiresideRTC(rtc.value);
		}

		if (_isFullscreen.value) {
			toggleFullscreen(false);
		}
		_fullscreenableElement.value = null;
	}

	/**
	 * Can be used to retry connecting to the fireside in case anything went
	 * wrong.
	 */
	function retry() {
		_disconnect();
		_tryJoin();
	}

	return controller;
}

export function useFiresideController() {
	return inject(FiresideControllerKey) || null;
}

export function provideFiresideController(c?: FiresideController | null) {
	provide(FiresideControllerKey, c);
}

export function _getGuestToken() {
	let token = sessionStorage.getItem('fireside-token');
	if (!token) {
		token = uuidv4();
		sessionStorage.setItem('fireside-token', token);
	}

	return token;
}

export function getFiresideLink(c: FiresideController, router: Router) {
	if (!c.fireside) {
		return;
	}
	return getAbsoluteLink(router, c.fireside.routeLocation);
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

export async function publishFireside(
	{ fireside, status, isDraft }: FiresideController,
	trigger: string
) {
	if (!fireside || status.value !== 'joined' || !isDraft.value) {
		return;
	}

	const ret = await ModalConfirm.show(
		$gettext(`Do you want to publish this fireside for the world to see?`)
	);
	if (!ret) {
		return;
	}

	await fireside.$publish({ autoFeature: true });
	showSuccessGrowl($gettext(`Your fireside is live!`));

	trackFiresidePublish(trigger);
}

async function extendFireside(c: FiresideController, growlOnFail = true) {
	if (c.status.value !== 'joined' || !c._canExtend.value || !c.fireside) {
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
			$gettext(`Settle down there. Wait a couple seconds before playing with the fire again.`)
		);
	}
}

export async function extinguishFireside(c: FiresideController, trigger: string) {
	if (!c.fireside || !c.canExtinguish.value) {
		return;
	}

	const result = await ModalConfirm.show(
		$gettext(
			`Are you sure you want to extinguish your Fireside? This will immediately close it and send all members home.`
		)
	);
	if (!result) {
		return;
	}

	trackFiresideExtinguish(trigger);
	await c.fireside.$extinguish();
}

export async function updateFiresideData(
	c: FiresideController,
	payload: { fireside?: unknown; chatSettings?: unknown; streamingInfo?: StreamingInfoPayload }
) {
	const {
		fireside,
		user,
		status,
		hosts,
		chatUsers,
		chatSettings,
		rtc,
		agoraStreamingInfo,
		revalidateRTC,
		cleanup,
		logger,
		checkExpiry,
	} = c;

	if (!fireside) {
		return;
	}

	// This function is used to update various pieces of fireside data, and it
	// may or may not get any particular data in the payload. We have to be
	// careful to just update when it's passed through.

	if (payload.fireside) {
		const updatedFireside = new Fireside(payload.fireside);
		const oldCommunityLinks = fireside.community_links;

		for (const updatedLink of updatedFireside.community_links) {
			const oldLink = oldCommunityLinks.find(
				i => i.community.id === updatedLink.community.id
			);
			if (!oldLink) {
				continue;
			}
			// Preserve the old Community model from the link, otherwise we will
			// overwrite perms.
			Object.assign(updatedLink, objectPick(oldLink, ['community']));
		}

		Object.assign(
			fireside,
			objectPick(updatedFireside, [
				'user',
				'header_media_item',
				'title',
				'expires_on',
				'is_expired',
				// is_streaming can't be sent through fireside-updated event
				// since this should be specific to the user now that we have
				// unlisted hosts.
				//
				// TODO(big-pp-event) we might want to sync this anyways. It is
				// currently used by components for minor display only stuff,
				// for instance the LIVE badge under the fireside bubble.
				//
				// 'is_streaming',
				'is_draft',
				// can't update member_count here for the same reason
				// we can't update is_streaming.
				//
				// 'member_count',
				'community_links',
			])
		);
	}

	if (payload.chatSettings) {
		chatSettings.value.assign(payload.chatSettings);
	}

	if (payload.streamingInfo) {
		// After updating hosts need to check if we transitioned into or out of
		// being a host.
		const wasHost = hosts.value.some(i => i.user.id === user.value?.id);
		hosts.value = _assignFollowingStateToHosts(
			c,
			_getHostsFromStreamingInfo(payload.streamingInfo)
		);
		chatUsers.value?.assignFiresideHostData(hosts.value);
		const isHost = hosts.value.some(i => i.user.id === user.value?.id);

		// If our host state changed, we need to update anything else depending
		// on streaming.
		if (isHost !== wasHost) {
			// Fetch for streaming returns stream enabled tokens if you are a
			// cohost. It also returns the new fireside information with the new
			// role included, which can be used to see if we've received
			// audience tokens or host tokens. This means we don't need to call
			// generate-streaming-tokens here, and that fireside RTC instance
			// would be upserted correctly.
			const success = await _fetchForFiresideStreaming(c, {
				assignStatus: false,
			});

			// Let them know they became a host if [_fetchForStreaming] assigned
			// a new role to them and didn't return a failure.
			//
			// If [_fetchForStreaming] failed, it's probably because they don't
			// have permissions to view this fireside anymore. This can happen
			// if they were removed as a host while the fireside was in a draft.
			if (success && fireside.role?.canStream === true) {
				showInfoGrowl(
					$gettext(`You've been added as a host to this fireside. Hop into the stream!`)
				);
			} else {
				// Let them know they were removed as a host.
				showInfoGrowl($gettext(`You've been removed as a host for this fireside.`));

				if (!success) {
					if (rtc.value) {
						// Destroy the RTC if it was already initialized.
						destroyFiresideRTC(rtc.value);
					}

					cleanup();
					status.value = 'setup-failed';
				}
			}
		} else {
			// It's possible that we get a fireside-updated grid event before
			// finishing bootstrapping - specifically before fetch-for-streaming
			// returns. when this happens we won't have a streaming uid, which
			// would make it impossible to initialize rtc. Also, this event does
			// not include our listable host ids. If we tried initializing rtc
			// with an empty list, it'd create everyone as muted, so it's better
			// to just always call fetch-for-streaming.
			const streamingUid = agoraStreamingInfo.value?.streamingUid;
			if (!streamingUid) {
				logger.debug('Got fireside-updated grid event before fully bootstrapped');
				await _fetchForFiresideStreaming(c, { assignStatus: false });
			} else if (!fireside.role?.canStream) {
				// Otherwise, if our host state did not change and we are a
				// viewer then this event has the new audience tokens.
				const newStreamingInfo = _getAgoraStreamingInfoFromPayload(payload.streamingInfo);

				// The payload in this event is not user specific, so it does
				// not contain our streaming uid. to avoid overwriting it with
				// undefined we set it to our existing value here.
				newStreamingInfo.streamingUid = streamingUid;

				// Finally, setting the agora streaming info on controller will
				// either upsert the rtc instance, or refresh the audience
				// tokens on the existing one.
				const hadRTC = !!rtc.value;
				agoraStreamingInfo.value = newStreamingInfo;

				// Forces immediate revalidation of RTC. This is needed in order
				// to avoid applying audience tokens if the RTC instance gets
				// torn down after setting the agora streaming info. If i don't
				// do this, the _wantsRTC will only reevaluate on next tick,
				// which happens after the if block below.
				const rtcInstance = revalidateRTC();
				const hasRTC = !!rtcInstance;

				// If this change did not end up upserting an RTC instance and
				// we had an existing instance, we need to tell it to apply the
				// new audience tokens we've received.
				if (hadRTC && hasRTC) {
					applyAudienceRTCTokens(
						rtcInstance,
						agoraStreamingInfo.value.videoToken,
						agoraStreamingInfo.value.chatToken
					);
				}
			}
		}
	}

	checkExpiry();
}

export function updateFiresideExpiryValues(c: FiresideController) {
	if (!c.fireside) {
		return;
	}

	const now = getCurrentServerTime();

	if (c.fireside.expires_on > now) {
		const expiresInS = c.fireside.getExpiryInMs() / 1000;

		// Automatically extend for them if we're in a draft and the remaining
		// duration gets low enough.
		if (c.isDraft.value && !c._isExtending.value && expiresInS <= 60) {
			c._isExtending.value = true;
			// Don't show growls if this fails.
			extendFireside(c, false);
			// Wait 5 seconds before we allow auto-extending again.
			setTimeout(() => {
				c._isExtending.value = false;
			}, 5_000);
		}

		if (expiresInS > 300) {
			c.expiresDurationText.value = undefined;
			c.expiresProgressValue.value = undefined;
		} else {
			c.expiresProgressValue.value = (expiresInS / 300) * 100;
			c.expiresDurationText.value = formatDuration(expiresInS);
		}
	} else {
		c.expiresProgressValue.value = undefined;
		c.expiresDurationText.value = undefined;
	}
}

function isListableHostStreaming(hosts: FiresideRTCHost[], listableHostIds: Set<number>): boolean {
	return hosts.some(i => {
		if (!i.isLive) {
			return false;
		}

		if (!i.needsPermissionToView) {
			return true;
		}

		return listableHostIds?.has(i.user.id);
	});
}

/**
 * Returns `false` if there was an error, `true` if not.
 */
async function _fetchForFiresideStreaming(c: FiresideController, { assignStatus = true }) {
	const { fireside, status, agoraStreamingInfo, hosts, chatUsers, listableHostIds, logger } = c;
	try {
		const payload = await Api.sendRequest<FullStreamingPayload>(
			`/web/fireside/fetch-for-streaming/${fireside.hash}`,
			undefined,
			{ detach: true }
		);

		logger.debug('fetch-for-streaming payload received', payload);

		if (!payload.fireside) {
			logger.debug(`Trying to load fireside, but it was not found.`);
			if (assignStatus) {
				status.value = 'setup-failed';
			}
			return false;
		}

		if (payload.serverTime) {
			updateServerTimeOffset(payload.serverTime);
		}

		fireside.assign(payload.fireside);

		// Note: the video/chat tokens returned here may be either the audience or cohost tokens,
		// depending on which role you have when you call fetch-for-streaming.
		const newStreamingInfo = _getAgoraStreamingInfoFromPayload(payload);
		newStreamingInfo.streamingUid = payload.streamingUid;
		agoraStreamingInfo.value = newStreamingInfo;

		hosts.value = _assignFollowingStateToHosts(c, _getHostsFromStreamingInfo(payload));
		chatUsers.value?.assignFiresideHostData(hosts.value);

		listableHostIds.value = new Set(payload.listableHostIds ?? []);

		// TODO(big-pp-event) need to renew audience tokens here somewhere?
		//
		// EDIT: we might not need to. this is done implicitly through
		// setting agoraStreamingInfo.
		//
		// EDIT2: we do need to do this since we
		// only set agora streaming info with audience tokens when we are a
		// viewer, but when we get degraded from a cohost to a viewer we
		// only call fetchForStreaming. Hmm... maybe the caller should do
		// that instead of here

		// If they have a host role, or if this fireside is actively
		// streaming, we'll get streaming tokens from the fetch payload. In
		// that case, we want to set up the RTC stuff.
		// this.upsertRtc(payload, { checkJoined: false });
	} catch (error) {
		logger.debug(`Setup failure 2.`, error);
		if (assignStatus) {
			status.value = 'setup-failed';
		}
		return false;
	}
	return true;
}

function _getAgoraStreamingInfoFromPayload(
	streamingInfo: StreamingInfoPayload
): AgoraStreamingInfo {
	return {
		appId: streamingInfo.streamingAppId,
		streamingUid: streamingInfo.streamingUid ?? 0,
		videoChannelName: streamingInfo.videoChannelName,
		videoToken: streamingInfo.videoToken,
		chatChannelName: streamingInfo.chatChannelName,
		chatToken: streamingInfo.chatToken,
	};
}

function _getHostsFromStreamingInfo(streamingInfo: StreamingInfoPayload) {
	const result: FiresideRTCHost[] = [];

	for (const field of ['hosts', 'unlistedHosts'] as const) {
		const isUnlisted = field === 'unlistedHosts';
		if (!streamingInfo[field]) {
			continue;
		}

		const streamingUids = streamingInfo.streamingUids ?? {};
		const streamingHostIds = streamingInfo.streamingHostIds ?? [];
		const hostUsers = User.populate(streamingInfo[field] ?? []) as User[];
		const hosts = hostUsers.map(user => {
			const isLive = streamingHostIds.includes(user.id);
			const uids = streamingUids[user.id] ?? [];

			return {
				user,
				needsPermissionToView: isUnlisted,
				isLive,
				uids,
			} as FiresideRTCHost;
		});

		result.push(...hosts);
	}

	return result;
}

/**
 * Loops over hosts and sets their `is_following` state to whatever value we've
 * fetched previously.
 */
function _assignFollowingStateToHosts(c: FiresideController, hosts: FiresideRTCHost[]) {
	hosts.forEach(i => {
		const { is_following, dogtags } = c.fetchedHostUserData.get(i.user.id) || {};
		i.user.is_following = is_following === true;
		i.user.dogtags = dogtags;
	});
	return hosts;
}
