import { h, triggerRef } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { objectPick } from '../../../../utils/object';
import { updateServerTimeOffset } from '../../../../utils/server-time';
import { sleep } from '../../../../utils/utils';
import { uuidv4 } from '../../../../utils/uuid';
import { shallowSetup } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { getCookie } from '../../../../_common/cookie/cookie.service';
import {
	setStickerStreak,
	useDrawerStore,
	onFiresideStickerPlaced,
} from '../../../../_common/drawer/drawer-store';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresideRole } from '../../../../_common/fireside/role/role.model';
import {
	AgoraStreamingInfo,
	applyAudienceRTCTokens,
	chooseFocusedRTCUser,
	destroyFiresideRTC,
	FiresideRTCHost,
} from '../../../../_common/fireside/rtc/rtc';
import { showInfoGrowl } from '../../../../_common/growls/growls.service';
import { StickerPlacement } from '../../../../_common/sticker/placement/placement.model';
import { addStickerToTarget } from '../../../../_common/sticker/target/target-controller';
import { useCommonStore } from '../../../../_common/store/common-store';
import { User } from '../../../../_common/user/user.model';
import { useAppStore } from '../../../store';
import { ChatStore, ChatStoreKey, clearChat, loadChat } from '../../chat/chat-store';
import { joinInstancedRoomChannel, leaveChatRoom, setGuestChatToken } from '../../chat/client';
import {
	createFiresideChannel,
	EVENT_LISTABLE_HOSTS,
	EVENT_STICKER_PLACEMENT,
	EVENT_STREAMING_UID,
	EVENT_UPDATE,
} from '../../grid/fireside-channel';
import {
	FiresideController,
	provideFiresideController,
	updateFiresideExpiryValues,
} from '../controller/controller';
import { StreamSetupModal } from '../stream/setup/setup-modal.service';

interface GridStickerPlacementPayload {
	user_id: number;
	streak: number;
	sticker_placement: Partial<StickerPlacement>;
}

interface StreamingInfoPayload {
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

interface FetchForStreamingPayload extends StreamingInfoPayload {
	streamingUid: number;
	fireside: unknown;
	serverTime: number;
	listableHostIds?: number[];
}

interface GridFiresideUpdatedPayload {
	fireside: unknown;
	// For optimization reasons streamingUids is not being sent for fireside-updated messages.
	streaming_info: Omit<StreamingInfoPayload, 'streamingUids'>;
}

interface GridStreamingUidAddedPayload {
	streaming_uid: number;
	user: unknown;
	is_live: boolean;
	is_unlisted: boolean;
}

interface GridListableHostsPayload {
	listable_host_ids?: number[];
}

@Options({})
export class AppFiresideContainer extends Vue {
	@Prop({ type: Object, required: true })
	controller!: FiresideController;

	/**
	 * Allows this component to modify the route when we encounter failures,
	 * such as losing streaming permissions and becoming ineligible to view the
	 * fireside.
	 */
	@Prop({ type: Boolean })
	allowRouteChanges!: boolean;

	store = setup(() => useAppStore());
	storeRaw = shallowSetup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	drawerStore = shallowSetup(() => useDrawerStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get user() {
		return this.commonStore.user;
	}

	get grid() {
		return this.store.grid;
	}

	get chat() {
		return this.chatStore.chat ?? undefined;
	}

	created() {
		provideFiresideController(this.controller);

		if (!this.$slots.default) {
			throw Error('AppFiresideContainer requires a default slot.');
		}
		this.controller.onRetry.value = this.onRetry;
	}

	render() {
		return h('div', {}, this.$slots.default!());
	}

	async mounted() {
		const c = this.controller;
		c.chat.value = this.chat;

		c.hasExpiryWarning.value = false;

		if (c.fireside.blocked) {
			c.status.value = 'blocked';
			console.debug(`[Fireside] Blocked from joining blocked user's fireside.`);
			return;
		}

		if (!this.grid) {
			this.store.loadGrid();
		}

		if (!this.chat) {
			loadChat(this.chatStore, this.storeRaw);
		}

		// Set up watchers to initiate connection once one of them boots up.
		// Both chat/grid reported connected when they are actually fully connected.
		// When a connection is dropped or any other error on the socket they immediately
		// become disconnected and then queue up for restarting.
		this.$watch('chat.connected', () => this.watchChat());
		this.$watch('grid.connected', () => this.watchGrid());

		// Both services may already be connected (watchers wouldn't fire),
		// so try joining manually now.
		this.tryJoin();
	}

	unmounted() {
		this.controller.onRetry.value = undefined;
		this.drawerStore.streak.value = null;

		this.disconnect();
		this.grid?.unsetGuestToken();

		if (this.chat?.isGuest) {
			clearChat(this.chatStore);
		}
	}

	watchChat() {
		console.debug(
			'[FIRESIDE] chat.connected watcher triggered: ' +
				(this.chat?.connected ? 'connected' : 'disconnected')
		);

		const c = this.controller;
		if (this.chat?.connected) {
			this.tryJoin();
		}
		// Only disconnect when not connected and it previous registered a different state.
		// This watcher runs once initially when chat is not connected, and we don't want to call
		// disconnect in that case.
		else if (c.chatPreviousConnectedState.value !== undefined) {
			this.disconnect();
		}

		c.chat.value = this.chat;
		c.chatPreviousConnectedState.value = this.chat?.connected === true;
	}

	watchGrid() {
		console.debug(
			'[FIRESIDE] grid.connected watcher triggered: ' +
				(this.grid?.connected ? 'connected' : 'disconnected')
		);

		const c = this.controller;
		if (this.grid?.connected) {
			this.tryJoin();
		}
		// Only disconnect when not connected and it previous registered a different state.
		// This watcher runs once initially when grid is not connected, and we don't want to call
		// disconnect in that case.
		else if (this.grid && c.gridPreviousConnectedState.value !== undefined) {
			this.disconnect();
		}

		c.gridPreviousConnectedState.value = this.grid?.connected ?? undefined;
	}

	private async tryJoin() {
		const c = this.controller;

		// Only try to join when disconnected (or for the first "initial" load).
		if (c.status.value === 'disconnected' || c.status.value === 'initial') {
			c.status.value = 'loading';

			// Make sure the services are connected.
			while (!this.grid?.connected) {
				console.debug('[FIRESIDE] Wait for Grid...');

				if (this.grid && !this.user && !this.grid.isGuest) {
					console.info('[FIRESIDE] Enabling guest access to grid');
					const authToken = await this.getAuthToken();
					if (!authToken) {
						throw new Error('Could not fetch guest token. This should be impossible');
					}
					await this.grid.setGuestToken(authToken);
				}

				await sleep(250);
			}

			while (!this.chat?.connected) {
				console.debug('[FIRESIDE] Wait for Chat...');

				if (this.chat && !this.user && !this.chat.isGuest) {
					console.info('[FIRESIDE] Enabling guest access to chat');
					const authToken = await this.getAuthToken();
					if (!authToken) {
						throw new Error('Could not fetch guest token. This should be impossible');
					}
					await setGuestChatToken(this.chat, authToken);
				}

				await sleep(250);
			}

			this.join();
		}
	}

	private async join() {
		console.debug(`[FIRESIDE] Joining fireside.`);
		const c = this.controller;

		// --- Make sure common join conditions are met.

		if (
			!c.fireside ||
			!this.grid ||
			!this.grid.connected ||
			!this.grid.socket ||
			!this.chat ||
			!this.chat.connected
		) {
			console.debug(`[FIRESIDE] General connection error.`);
			c.status.value = 'setup-failed';
			return;
		}

		const authToken = await this.getAuthToken();
		if (!authToken) {
			console.debug(`[FIRESIDE] Setup failure 1.`);
			c.status.value = 'setup-failed';
			return;
		}

		// --- Refetch fireside information and check that it's not yet expired.

		const canProceed = await this._fetchForStreaming({ assignRouteStatus: true });
		if (!canProceed) {
			return;
		}

		// Maybe they are blocked now?
		if (c.fireside.blocked) {
			c.status.value = 'blocked';
			console.debug(`[Fireside] Blocked from joining blocked user's fireside.`);
			return;
		}

		// Make sure it's still joinable.
		if (!c.fireside.isOpen()) {
			console.debug(`[FIRESIDE] Fireside is expired, and cannot be joined.`);
			c.status.value = 'expired';
			return;
		}

		// --- Make them join the fireside (if they aren't already).

		if (this.user && !c.fireside.role) {
			const rolePayload = await Api.sendRequest(`/web/fireside/join/${c.fireside.hash}`);
			if (!rolePayload || !rolePayload.success || !rolePayload.role) {
				console.debug(`[FIRESIDE] Failed to acquire a role.`);
				c.status.value = 'setup-failed';
				return;
			}
			c.fireside.role = new FiresideRole(rolePayload.role);
		}

		// --- Join Grid channel.

		const channel = createFiresideChannel({
			fireside: c.fireside,
			socket: this.grid.socket,
			user: this.user,
			authToken,
		});

		// Subscribe to the update event.
		channel.socketChannel.on(EVENT_UPDATE, this.onGridUpdateFireside.bind(this));
		channel.socketChannel.on(EVENT_STREAMING_UID, this.onGridStreamingUidAdded.bind(this));
		channel.socketChannel.on(EVENT_STICKER_PLACEMENT, this.onGridStickerPlacement.bind(this));

		try {
			await new Promise<void>((resolve, reject) => {
				channel.socketChannel
					.join()
					.receive('error', reject)
					.receive('ok', () => {
						c.gridChannel.value = channel;
						this.grid!.firesideChannels.push(channel);
						resolve();
					});
			});
		} catch (error: any) {
			console.debug(`[FIRESIDE] Setup failure 3.`, error);
			if (error && error.reason === 'blocked') {
				c.status.value = 'blocked';
			} else {
				c.status.value = 'setup-failed';
			}
			return;
		}

		// --- Join Grid DM channel.

		if (this.user) {
			const dmChannel = createFiresideChannel({
				fireside: c.fireside,
				topic: `fireside-dm:${c.fireside.hash}:${this.user.id}`,
				socket: this.grid.socket,
				user: this.user,
				authToken,
			});

			// Subscribe to the listable hosts event.
			dmChannel.socketChannel.on(EVENT_LISTABLE_HOSTS, this.onGridListableHosts.bind(this));

			try {
				await new Promise<void>((resolve, reject) => {
					dmChannel.socketChannel
						.join()
						.receive('error', reject)
						.receive('ok', () => {
							c.gridDMChannel.value = dmChannel;
							this.grid!.firesideChannels.push(dmChannel);
							resolve();
						});
				});
			} catch (error: any) {
				console.debug(`[FIRESIDE] Setup failure 4.`, error);
				if (error && error.reason === 'blocked') {
					c.status.value = 'blocked';
				} else {
					c.status.value = 'setup-failed';
				}
				return;
			}
		}

		// Now join the chat's room channel.
		try {
			const chatChannel = await joinInstancedRoomChannel(this.chat, c.fireside.chat_room_id);

			if (!chatChannel) {
				console.debug(`[FIRESIDE] Setup failure 5.`);
				c.status.value = 'setup-failed';
				return;
			}

			c.chatChannel.value = chatChannel;
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 6.`, error);
			c.status.value = 'setup-failed';
			return;
		}

		c.chatChannel.value.socketChannel.on('kick_member', (data: any) => {
			if (this.user && data.user_id === this.user.id) {
				showInfoGrowl(this.$gettext(`You've been kicked from the fireside.`));
				this.$router.push({ name: 'home' });
			}
		});

		c.status.value = 'joined';
		console.debug(`[FIRESIDE] Successfully joined fireside.`);

		// Set up the expiry interval to check if the fireside is expired.
		this.clearExpiryCheck();
		c.expiryInterval.value = setInterval(this.expiryCheck.bind(this), 1000);
		this.expiryCheck();

		this.setupExpiryInfoInterval();
		updateFiresideExpiryValues(c);
	}

	/**
	 * Returns [false] if there was an error, [true] if not.
	 */
	private async _fetchForStreaming({ assignRouteStatus = true }) {
		const c = this.controller;
		try {
			const payload = (await Api.sendRequest(
				`/web/fireside/fetch-for-streaming/${c.fireside.hash}`,
				undefined,
				{ detach: true }
			)) as FetchForStreamingPayload;

			console.debug('[FIRESIDE] fetch-for-streaming payload received', payload);

			if (!payload.fireside) {
				console.debug(`[FIRESIDE] Trying to load fireside, but it was not found.`);
				if (assignRouteStatus) {
					c.status.value = 'setup-failed';
				}
				return false;
			}

			if (payload.serverTime) {
				updateServerTimeOffset(payload.serverTime);
			}

			c.fireside.assign(payload.fireside);

			// Note: the video/chat tokens returned here may be either the audience or cohost tokens,
			// depending on which role you have when you call fetch-for-streaming.
			const agoraStreamingInfo = this.getAgoraStreamingInfoFromPayload(payload);
			agoraStreamingInfo.streamingUid = payload.streamingUid;
			c.agoraStreamingInfo.value = agoraStreamingInfo;

			c.hosts.value = this.getHostsFromStreamingInfo(payload);
			c.listableHostIds.value = payload.listableHostIds ?? [];

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
			console.debug(`[FIRESIDE] Setup failure 2.`, error);
			if (assignRouteStatus) {
				c.status.value = 'setup-failed';
			}
			return false;
		}
		return true;
	}

	private async getAuthToken() {
		if (this.user) {
			return await getCookie('frontend');
		}

		let token = sessionStorage.getItem('fireside-token');
		if (!token) {
			token = uuidv4();
			sessionStorage.setItem('fireside-token', token);
		}

		return token;
	}

	private disconnect() {
		const c = this.controller;
		if (!c || c.status.value === 'disconnected') {
			return;
		}

		console.debug(`[FIRESIDE] Disconnecting from fireside.`);
		c.status.value = 'disconnected';

		this.clearExpiryCheck();
		this.destroyExpiryInfoInterval();

		if (this.grid?.connected && (c.gridChannel.value || c.gridDMChannel.value)) {
			this.grid.leaveFireside(c.fireside);
		}
		c.gridChannel.value = undefined;
		c.gridDMChannel.value = undefined;

		if (this.chat?.connected && c.chatChannel.value) {
			leaveChatRoom(this.chat, c.chatChannel.value.room);
		}
		c.chatChannel.value = undefined;

		StreamSetupModal.close();

		console.debug(`[FIRESIDE] Disconnected from fireside.`);
	}

	private clearExpiryCheck() {
		const c = this.controller;
		if (c.expiryInterval.value) {
			clearInterval(c.expiryInterval.value);
			c.expiryInterval.value = undefined;
		}
	}

	private expiryCheck() {
		const c = this.controller;
		if (!c || c.status.value !== 'joined' || !c.fireside) {
			return;
		}

		if (!c.fireside.isOpen()) {
			this.disconnect();
			c.status.value = 'expired';
		}
	}

	private destroyExpiryInfoInterval() {
		const c = this.controller;
		if (c.updateInterval.value) {
			clearInterval(c.updateInterval.value);
			c.updateInterval.value = undefined;
		}
	}

	private setupExpiryInfoInterval() {
		const c = this.controller;
		this.destroyExpiryInfoInterval();
		c.updateInterval.value = setInterval(() => updateFiresideExpiryValues(c), 1000);
	}

	private getAgoraStreamingInfoFromPayload(
		streamingInfo: FetchForStreamingPayload | GridFiresideUpdatedPayload['streaming_info']
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

	private getHostsFromStreamingInfo(streamingInfo: StreamingInfoPayload) {
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

	private onRetry() {
		this.disconnect();
		this.tryJoin();
	}

	async onGridUpdateFireside(payload: GridFiresideUpdatedPayload) {
		console.log('Fireside update message:');
		console.log(payload);

		const c = this.controller;
		if (!c.fireside || !payload.fireside) {
			return;
		}

		const updatedFireside = new Fireside(payload.fireside);
		const oldCommunityLinks = c.fireside.community_links;

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
			c.fireside,
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

		// After updating hosts need to check if we trasitioned into or out of being a host.
		const wasHost = c.hosts.value.some(host => host.user.id === this.user?.id);
		c.hosts.value = this.getHostsFromStreamingInfo(payload.streaming_info);
		const isHost = c.hosts.value.some(host => host.user.id === this.user?.id);

		// If our host state changed, we need to update anything else
		// depending on streaming.
		if (isHost !== wasHost) {
			// Fetch for streaming returns stream enabled tokens if you are a
			// cohost. It also returns the new fireside information with the new
			// role included, which can be used to see if we've received
			// audience tokens or host tokens. This means we don't need to call
			// generate-streaming-tokens here, and that fireside RTC instance
			// would be upserted correctly.
			const success = await this._fetchForStreaming({ assignRouteStatus: false });

			// Let them know they became a host if [_fetchForStreaming] assigned
			// a new role to them and didn't return a failure.
			//
			// If [_fetchForStreaming] failed, it's probably because they don't
			// have permissions to view this fireside anymore. This can happen
			// if they were removed as a host while the fireside was in a draft.
			if (success && c.fireside.role?.canStream === true) {
				showInfoGrowl(
					this.$gettext(
						`You've been added as a host to this fireside. Hop into the stream!`
					)
				);
			} else {
				// Let them know they were removed as a host.
				showInfoGrowl(this.$gettext(`You've been removed as a host for this fireside.`));

				if (!success) {
					if (c.rtc.value) {
						// Destroy the RTC if it was already initialized.
						destroyFiresideRTC(c.rtc.value);
					}
					c.cleanup();

					if (this.allowRouteChanges) {
						// If this component is allowed to control route
						// changes, replace our current view with a 404.
						this.commonStore.setError(404);
					}
					c.status.value = 'setup-failed';
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
			const streamingUid = c.agoraStreamingInfo.value?.streamingUid;
			if (!streamingUid) {
				console.debug(
					'[FIRESIDE] Got fireside-updated grid event before fully bootstrapped'
				);
				await this._fetchForStreaming({ assignRouteStatus: false });
			} else if (!c.fireside.role?.canStream) {
				// Otherwise, if our host state did not change and we are a viewer then this event
				// has the new audience tokens.
				const agoraStreamingInfo = this.getAgoraStreamingInfoFromPayload(
					payload.streaming_info
				);

				// The payload in this event is not user specific, so it does not contain
				// our streaming uid. to avoid overwriting it with undefined we set it to our
				// existing value here.
				agoraStreamingInfo.streamingUid = streamingUid;

				// Finally, setting the agora streaming info on controller will either upsert
				// the rtc instance, or refresh the audience tokens on the existing one.
				const hadRTC = !!c.rtc.value;
				c.agoraStreamingInfo.value = agoraStreamingInfo;

				// Forces immediate revalidation of RTC. This is needed in order
				// to avoid applying audience tokens if the RTC instance gets
				// torn down after setting the agora streaming info. If i don't
				// do this, the _wantsRTC will only reevaluate on next tick,
				// which happens after the if block below.
				const rtcInstance = c.revalidateRTC();
				const hasRTC = !!rtcInstance;

				// If this change did not end up upserting an RTC instance and we had an existing
				// instance, we need to tell it to apply the new audience tokens we've received.
				if (hadRTC && hasRTC) {
					applyAudienceRTCTokens(
						rtcInstance,
						c.agoraStreamingInfo.value.videoToken,
						c.agoraStreamingInfo.value.chatToken
					);
				}
			}
		}

		this.expiryCheck();
	}

	onGridStreamingUidAdded(payload: GridStreamingUidAddedPayload) {
		console.debug('[FIRESIDE] Grid streaming uid added.', payload);

		const { hosts } = this.controller;
		if (!payload.streaming_uid || !payload.user) {
			return;
		}

		const user = new User(payload.user);
		const host = hosts.value.find(host => host.user.id === user.id);
		if (host) {
			console.debug('[FIRESIDE] Adding streaming uid to existing host');

			host.user = user;
			host.needsPermissionToView = payload.is_unlisted;
			host.isLive = payload.is_live;
			if (host.uids.indexOf(payload.streaming_uid) === -1) {
				host.uids.push(payload.streaming_uid);
			}
		} else {
			console.debug('[FIRESIDE] Adding streaming uid to new host');
			hosts.value.push({
				user: user,
				needsPermissionToView: payload.is_unlisted,
				isLive: payload.is_live,
				uids: [payload.streaming_uid],
			} as FiresideRTCHost);
		}

		// Vue does not pick up the change to uids for existing hosts, and I
		// can't be assed to figure out what in the world i need to wrap in
		// a reactive() to make it work.
		triggerRef(hosts);
	}

	onGridStickerPlacement(payload: GridStickerPlacementPayload) {
		console.debug('[FIRESIDE] Grid sticker placement received.', payload, payload.streak);
		const c = this.controller;
		const placement = new StickerPlacement(payload.sticker_placement);

		setStickerStreak(this.drawerStore, placement.sticker, payload.streak);

		const wasMyPlacement = payload.user_id === this.user?.id;

		// Stickers and counts get added automatically when we place them
		// ourselves. Return early so we don't do it twice.
		if (wasMyPlacement) {
			return;
		}

		const focusedUserId = this.controller.rtc.value?.focusedUser?.userModel?.id;
		const targetUserId = placement.target_data.host_user_id;

		// TODO(live-fireside-stickers) Do we want the first two checks here?
		// should it always show if you don't have a focused user? always show
		// if there was no target host somehow?
		if (focusedUserId === targetUserId) {
			// Display the live sticker only if we're watching the target host.
			addStickerToTarget(c.stickerTargetController, placement);
		} else {
			// TODO(live-fireside-stickers) eventbus stuff, wiggle target user
			// avatars or popcorn stickers near them in the host list.
			onFiresideStickerPlaced.next(placement);
		}

		c.fireside.addStickerToCount(placement.sticker);
	}

	onGridListableHosts(payload: GridListableHostsPayload) {
		console.debug('[FIRESIDE] Grid listable hosts.', payload);
		const { listableHostIds, rtc } = this.controller;

		listableHostIds.value = payload.listable_host_ids ?? [];

		if (rtc.value) {
			chooseFocusedRTCUser(rtc.value);
		}
	}
}
