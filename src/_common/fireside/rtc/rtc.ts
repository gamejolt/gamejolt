// export class FiresideRTC {
// 	constructor(
// 		public readonly fireside: Fireside,
// 		public readonly userId: number | null,
// 		public readonly listableHostIds: Set<number>,
// 		{ isMuted }: Options
// 	) {
// 		this.isMuted = isMuted ?? false;
// 	}

// 	readonly isMuted;

// 	generation = new CancelToken();

// 	/**
// 	 *  Safari keeps [AgoraRTC.onAutoplayFailed] looping, so I'm assigning
// 	 *  to this to ensure we only trigger the failure callback once.
// 	 */
// 	_hasAutoplayError = false;
// 	shouldShowMutedIndicator = false;

// 	/**
// 	 * The list of {@link FiresideRTCHost}s that currently have an agora stream published.
// 	 *
// 	 * @deprecated
// 	 */
// 	readonly _remoteStreamingUsers: FiresideRTCHost[] = [];
// 	focusedUser: FiresideRTCHost | null = null;

// 	videoPaused = false;
// 	volumeLevelInterval: NodeJS.Timer | null = null;
// 	shouldShowVideoThumbnails = false;
// 	shouldShowVideoStats = false;
// 	producer: FiresideRTCProducer | null = null;

// 	setupFinalized = false;
// 	finalizeSetupFn: (() => void) | null = null;

// 	log(message: any, ...optionalParams: any[]) {
// 		console.log('[FIRESIDE-RTC] ' + message, ...optionalParams);
// 	}

// 	logWarning(message: any, ...optionalParams: any[]) {
// 		console.warn('[FIRESIDE-RTC] ' + message, ...optionalParams);
// 	}

// 	logError(message: any, ...optionalParams: any[]) {
// 		console.error('[FIRESIDE-RTC] ' + message, ...optionalParams);
// 	}

// 	/**
// 	 * The local {@link FiresideRTCHost} if they're currently streaming.
// 	 */
// 	localUser: FiresideRTCHost | null = null;

// 	get role() {
// 		return this.fireside.role;
// 	}

// 	/**
// 	 * Remote users + the local user prepended if it is set.
// 	 * Note: the local user is set if they are currently streaming.
// 	 *
// 	 * @deprecated
// 	 */
// 	get _allStreamingUsers() {
// 		// If we are streaming from a different tab then we will already have a
// 		// remote user correlating to the same gj user our local user correlates
// 		// to.
// 		return this.localUser
// 			? [this.localUser, ...this._remoteStreamingUsers]
// 			: [...this._remoteStreamingUsers];
// 	}

// 	/**
// 	 * @deprecated
// 	 */
// 	get listableStreamingUsers() {
// 		return this._allStreamingUsers.filter(rtcUser => rtcUser.isListed);
// 	}

// 	/**
// 	 * If the current user is currently streaming in this fireside. This will
// 	 * only return valid data once everything gets subscribed to.
// 	 */
// 	get isPersonallyStreaming() {
// 		return this.localUser !== null;
// 	}

// 	get isFocusingMe() {
// 		return (
// 			!!this.focusedUser &&
// 			!!this.localUser &&
// 			this.focusedUser.userId === this.localUser.userId
// 		);
// 	}
// }

// /**
//  * Basically a mixin. Will be used to extend the {@link FiresideController} with
//  * RTC functionality.
//  */
// export function createRTCForFireside(options: {
// 	fireside: Fireside;
// 	// agoraStreamingInfo: AgoraStreamingInfo,
// 	// listableHostIds: Ref<Set<number>>,
// 	// hostBackgrounds: Ref<Map<number, Background>>,
// 	hosts: Ref<FiresideRTCHost[]>;
// 	isMuted: boolean;
// }) {
// 	const { fireside, hosts } = options;
// 	const isMuted = ref(options.isMuted || false);

// 	const generation = ref(new CancelToken());

// 	/**
// 	 *  Safari keeps [AgoraRTC.onAutoplayFailed] looping, so I'm assigning
// 	 *  to this to ensure we only trigger the failure callback once.
// 	 */
// 	const _hasAutoplayError = ref(false);
// 	const shouldShowMutedIndicator = ref(false);

// 	/**
// 	 * The list of {@link FiresideRTCHost}s that currently have an agora stream published.
// 	 *
// 	 * @deprecated
// 	 */
// 	const _remoteStreamingUsers = ref([]) as Ref<FiresideRTCHost[]>;
// 	const focusedUser = ref(null) as Ref<FiresideRTCHost | null>;

// 	const videoPaused = ref(false);
// 	const volumeLevelInterval = ref(null) as Ref<NodeJS.Timer | null>;
// 	const shouldShowVideoThumbnails = ref(false);
// 	const shouldShowVideoStats = ref(false);
// 	const producer = shallowRef<FiresideRTCProducer | null>(null);

// 	const setupFinalized = ref(false);
// 	const finalizeSetupFn = shallowRef<(() => void) | null>(null);

// 	function log(message: any, ...optionalParams: any[]) {
// 		console.log('[FIRESIDE-RTC] ' + message, ...optionalParams);
// 	}

// 	function logWarning(message: any, ...optionalParams: any[]) {
// 		console.warn('[FIRESIDE-RTC] ' + message, ...optionalParams);
// 	}

// 	function logError(message: any, ...optionalParams: any[]) {
// 		console.error('[FIRESIDE-RTC] ' + message, ...optionalParams);
// 	}

// 	/**
// 	 * The local {@link FiresideRTCHost} if they're currently streaming.
// 	 */
// 	const localUser = ref(null) as Ref<FiresideRTCHost | null>;

// 	const role = computed(() => fireside.role);

// 	/**
// 	 * Remote users + the local user prepended if it is set.
// 	 * Note: the local user is set if they are currently streaming.
// 	 *
// 	 * @deprecated
// 	 */
// 	const _allStreamingUsers = computed(() => {
// 		// If we are streaming from a different tab then we will already have a
// 		// remote user correlating to the same gj user our local user correlates
// 		// to.
// 		return localUser.value
// 			? [localUser.value, ..._remoteStreamingUsers.value]
// 			: [..._remoteStreamingUsers.value];
// 	});

// 	/**
// 	 * @deprecated
// 	 */
// 	const listableStreamingUsers = computed(() => {
// 		return _allStreamingUsers.value;
// 	});

// 	/**
// 	 * If the current user is currently streaming in this fireside. This will
// 	 * only return valid data once everything gets subscribed to.
// 	 */
// 	const isPersonallyStreaming = computed(() => {
// 		return localUser.value !== null;
// 	});

// 	const isFocusingMe = computed(() => {
// 		return (
// 			!!focusedUser.value &&
// 			!!localUser.value &&
// 			focusedUser.value.userId === localUser.value.userId
// 		);
// 	});

// 	return shallowReadonly({
// 		isMuted,
// 		generation,
// 		_hasAutoplayError,
// 		shouldShowMutedIndicator,
// 		_remoteStreamingUsers,
// 		focusedUser,
// 		videoPaused,
// 		volumeLevelInterval,
// 		shouldShowVideoThumbnails,
// 		shouldShowVideoStats,
// 		producer,
// 		setupFinalized,
// 		finalizeSetupFn,
// 		log,
// 		logWarning,
// 		logError,
// 		localUser,
// 		role,
// 		_allStreamingUsers,
// 		listableStreamingUsers,
// 		isPersonallyStreaming,
// 		isFocusingMe,
// 	});

// 	// const rtc = reactive(
// 	// 	new FiresideRTC(
// 	// 		fireside,
// 	// 		userId,
// 	// 		// agoraStreamingInfo.appId,
// 	// 		// agoraStreamingInfo.streamingUid,
// 	// 		// agoraStreamingInfo.videoChannelName,
// 	// 		// agoraStreamingInfo.videoToken,
// 	// 		// agoraStreamingInfo.chatChannelName,
// 	// 		// agoraStreamingInfo.chatToken,
// 	// 		// Stop typescript from complaining about Vue types.
// 	// 		//
// 	// 		// `reactive` will unwrap refs, but the type is still technically
// 	// 		// wrong until the class is constructed and `reactive` can unwrap
// 	// 		// the fields.
// 	// 		listableHostIds as unknown as Set<number>,
// 	// 		// hostBackgrounds as unknown as Map<number, Background>,
// 	// 		options
// 	// 	)
// 	// ) as FiresideRTC;
// }

// export async function destroyFiresideRTC(rtc: FiresideRTC) {
// 	rtc.log('Trace(destroy)');

// 	// Don't assign a new one so that we stay in a canceled state.
// 	rtc.generation.cancel();

// 	const wasStreaming = !!rtc.producer?.isStreaming.value;
// 	if (rtc.producer) {
// 		// TODO(oven)
// 		// if (wasStreaming) {
// 		// 	// cleanupFiresideRTCProducer does not call stopStreaming,
// 		// 	// so some teardown logic needs to be done here.
// 		// 	// The actual streams are closed and destroyed later in this function.
// 		// 	updateSetIsStreaming(rtc.producer, { isStreaming: false });
// 		// }

// 		cleanupFiresideRTCProducer(rtc.producer);
// 		rtc.producer = null;
// 	}

// 	try {
// 		await Promise.all(
// 			rtc._allStreamingUsers.map(user =>
// 				Promise.all([
// 					setVideoPlayState(user, false),
// 					setDesktopAudioPlayState(user, false),
// 					setMicAudioPlayState(user, false),
// 				])
// 			)
// 		);
// 	} catch (e) {
// 		rtc.logWarning('Error while stopping playback. Ignoring.');
// 		rtc.logWarning(e);
// 	}

// 	// const { videoChannel, chatChannel } = rtc;
// 	// try {
// 	// 	await Promise.all([destroyChannel(videoChannel), destroyChannel(chatChannel)]);
// 	// } catch (e) {
// 	// 	rtc.logError(`Failed to destroy the Fireside RTC. Reloading...`, e);
// 	// 	// reload the page, anything we do now is no longer reliable.
// 	// 	Navigate.reload();
// 	// 	return;
// 	// }

// 	if (rtc.volumeLevelInterval !== null) {
// 		clearInterval(rtc.volumeLevelInterval);
// 		rtc.volumeLevelInterval = null;
// 	}

// 	rtc.focusedUser = null;
// }

// /**
//  * Before doing some stuff (like choosing the best initial stream to show) we
//  * want some of the system to initialize (subscribe to hosts and stuff). This
//  * allows us to do a sort of delayed setup.
//  */
// function _finalizeSetup(rtc: FiresideRTC) {
// 	if (rtc.setupFinalized) {
// 		// Run the debounced finalizeSetupFn again if the focusedUser doesn't
// 		// exist or match any of our current hosts.
// 		if (!rtc.focusedUser && rtc.finalizeSetupFn) {
// 			rtc.finalizeSetupFn?.();
// 		}
// 		return;
// 	}

// 	rtc.finalizeSetupFn ??= debounce(() => {
// 		// We dont want side effects from canceled rtc instances.
// 		if (rtc.generation.isCanceled) {
// 			return;
// 		}

// 		chooseFocusedRTCUser(rtc);

// 		if (!rtc.setupFinalized) {
// 			rtc.setupFinalized = true;
// 			rtc.log(`Setup finalized.`);
// 		}
// 	}, 500);

// 	rtc.log(`Debouncing finalize setup.`);
// 	rtc.finalizeSetupFn?.();
// }

// function _createChannels(rtc: FiresideRTC) {
// 	rtc.log('Trace(createChannels)');

// 	if (!AgoraRTC) {
// 		throw new Error('Expected AgoraRTC to be resolved by now');
// 	}

// 	(AgoraRTC as any).setParameter('AUDIO_SOURCE_VOLUME_UPDATE_INTERVAL', 100);

// 	// If we fail to autoplay, pause the stream so we have to interact with the
// 	// DOM to play it.
// 	AgoraRTC.onAutoplayFailed = async () => {
// 		if (rtc._hasAutoplayError) {
// 			return;
// 		}
// 		rtc._hasAutoplayError = true;

// 		// Pause videos and indicate that the video is currently playing in a
// 		// muted state.
// 		const wasPaused = rtc.videoPaused;
// 		rtc.videoPaused = true;
// 		rtc.shouldShowMutedIndicator = true;

// 		// Any document interaction seems sufficient to cause the audio to play
// 		// once all the stream subscriptions are active.
// 		window.document.addEventListener(
// 			'click',
// 			async () => {
// 				rtc._hasAutoplayError = false;
// 				rtc.shouldShowMutedIndicator = false;

// 				// Wait a moment in case the way they triggered this way by
// 				// clicking the play button.
// 				await sleep(0);
// 				// Set [videoPaused] to its previous state if we're still
// 				// paused.
// 				if (rtc.videoPaused) {
// 					rtc.videoPaused = wasPaused;
// 				}
// 			},
// 			{
// 				once: true,
// 				capture: true,
// 				passive: true,
// 			}
// 		);
// 	};

// 	rtc.volumeLevelInterval = setInterval(() => _updateVolumeLevels(rtc), 100);

// 	rtc.videoChannel = createFiresideRTCChannel(
// 		rtc,
// 		rtc.videoChannelName,
// 		rtc.videoToken,
// 		AgoraRTC,
// 		{
// 			onTrackPublish(remoteUser, mediaType) {
// 				rtc.log('Got user published (video channel)');

// 				const user = _findOrAddRemoteUser(rtc, remoteUser);
// 				if (!user) {
// 					rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
// 					return;
// 				}

// 				user.remoteVideoUser = markRaw(remoteUser);

// 				if (mediaType === 'video') {
// 					setUserHasVideo(user, true);
// 				} else {
// 					setUserHasDesktopAudio(user, true);
// 				}

// 				_finalizeSetup(rtc);
// 			},
// 			onTrackUnpublish(remoteUser, mediaType) {
// 				rtc.log('Got user unpublished (video channel)');

// 				// Ideally we'd like to check _remoteStreamingUsers but I don't trust Agora
// 				// to actually emit these events only for remote users.
// 				// If it gets emitted for a local user we'll throw.
// 				const user = rtc._allStreamingUsers.find(i => i.userId === remoteUser.uid);
// 				if (!user) {
// 					rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
// 					return;
// 				}

// 				// Safeguard against Agora emitting these events for local users.
// 				if (user.isLocal) {
// 					throw new Error('Expected to be handling remote users here');
// 				}

// 				if (mediaType === 'video') {
// 					setUserHasVideo(user, false);
// 				} else {
// 					setUserHasDesktopAudio(user, false);
// 				}

// 				_removeUserIfNeeded(rtc, user);
// 			},
// 		}
// 	);

// 	rtc.chatChannel = createFiresideRTCChannel(rtc, rtc.chatChannelName, rtc.chatToken, AgoraRTC, {
// 		onTrackPublish(remoteUser, mediaType) {
// 			rtc.log('got user published (audio chat channel)');

// 			if (mediaType !== 'audio') {
// 				rtc.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
// 				return;
// 			}

// 			const user = _findOrAddRemoteUser(rtc, remoteUser);
// 			if (!user) {
// 				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
// 				return;
// 			}

// 			user.remoteChatUser = markRaw(remoteUser);
// 			setUserHasMicAudio(user, true);

// 			_finalizeSetup(rtc);
// 		},
// 		onTrackUnpublish(remoteUser, mediaType) {
// 			rtc.log('Got user unpublished (audio channel)');

// 			// This should never trigger.
// 			if (mediaType !== 'audio') {
// 				rtc.logWarning('Unexpected media type: ' + mediaType + '. Ignoring');
// 				return;
// 			}

// 			// Ideally we'd like to check _remoteStreamingUsers but I don't trust Agora
// 			// to actually emit these events only for remote users.
// 			// If it gets emitted for a local user we'll throw.
// 			const user = rtc._allStreamingUsers.find(i => i.userId === remoteUser.uid);
// 			if (!user) {
// 				rtc.logWarning(`Couldn't find remote user locally`, remoteUser);
// 				return;
// 			}

// 			// Safeguard against Agora emitting these events for local users.
// 			if (user.isLocal) {
// 				throw new Error('Expected to be handling remote users here');
// 			}

// 			setUserHasMicAudio(user, false);
// 			_removeUserIfNeeded(rtc, user);
// 		},
// 	});
// }

// export function chooseFocusedRTCUser(rtc: FiresideRTC) {
// 	// We only choose a new focused user if the current one is unset or is unlisted.
// 	if (rtc.focusedUser) {
// 		return;
// 	}

// 	let bestUser: FiresideHost | null = null;
// 	let bestScore = -1;

// 	for (const user of rtc.listableStreamingUsers) {
// 		const score =
// 			(user.hasVideo ? 4 : 0) + (user.hasMicAudio ? 2 : 0) + (user.hasDesktopAudio ? 1 : 0);
// 		if (score > bestScore) {
// 			bestUser = user;
// 			bestScore = score;
// 		}
// 	}

// 	rtc.focusedUser = bestUser;
// }

// function _updateVolumeLevels(rtc: FiresideRTC) {
// 	/**
// 	 * Checking against {@link rtc._allStreamingUsers} which includes the local
// 	 * user. Change to {@link rtc._remoteStreamingUsers} if we want to disable
// 	 * host thumb indicators for self.
// 	 */
// 	for (const user of rtc._allStreamingUsers) {
// 		updateVolumeLevel(user);
// 	}
// }
