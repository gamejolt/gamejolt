import { h } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { objectPick } from '../../../../utils/object';
import { updateServerTimeOffset } from '../../../../utils/server-time';
import { sleep } from '../../../../utils/utils';
import { uuidv4 } from '../../../../utils/uuid';
import { shallowSetup } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { getCookie } from '../../../../_common/cookie/cookie.service';
import { setStickerStreak, useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresideRole } from '../../../../_common/fireside/role/role.model';
import {
	chooseFocusedRTCUser,
	destroyFiresideRTC,
	FiresideRTCHost,
	AgoraStreamingInfo,
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

@Options({})
export class AppFiresideContainer extends Vue {
	@Prop({ type: Object, required: true })
	controller!: FiresideController;

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

	private async _fetchForStreaming({ assignRouteStatus = true }) {
		const c = this.controller;
		try {
			const payload = await Api.sendRequest(
				`/web/fireside/fetch-for-streaming/${c.fireside.hash}`,
				undefined,
				{ detach: true }
			);

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
			c.agoraStreamingInfo.value = this.getAgoraStreamingInfoFromStreamingInfo(payload);
			c.hosts.value = this.getHostsFromStreamingInfo(payload);
			c.listableHostIds.value = payload.listableHostIds ?? [];

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
		// TODO(big-pp-event) this needs to be managed through controller.
		this.destroyRtc();

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

	private async upsertRtc(
		payload: any,
		options: {
			checkJoined?: boolean;
			hosts?: FiresideRTCHost[];
			listableHostIds?: number[];
		} = {
			checkJoined: true,
		}
	) {
		const { checkJoined = true } = options;
		const c = this.controller;
		// TODO(big-pp-event) what is the checkJoined solving?
		if (!c || !c.fireside || (checkJoined && c.status.value !== 'joined')) {
			return;
		}

		// If they don't have tokens yet, then they don't need to set up the RTC
		// stuff.
		if (!payload.videoToken || !payload.chatToken) {
			return;
		}

		if (!c.rtc.value) {
			const hosts = options.hosts ?? this.getHostsFromStreamingInfo(payload) ?? [];

			const listableHostIds = options.listableHostIds ?? c.listableHostIds.value;
			if (!listableHostIds) {
				throw new Error(
					'Expected listable hosts to be set by the time Fireside RTC is initialized'
				);
			}
			c.listableHostIds.value = listableHostIds;

			c.rtc.value = createFiresideRTC(
				c.fireside,
				this.user?.id ?? null,
				payload.streamingAppId,
				payload.streamingUid,
				payload.videoChannelName,
				payload.videoToken,
				payload.chatChannelName,
				payload.chatToken,
				hosts,
				listableHostIds,
				{ isMuted: c.isMuted }
			);
		} else if (!c.rtc.value.producer) {
			// TODO(big-pp-event) need to call this when tokens change
			applyAudienceRTCTokens(c.rtc.value, payload.videoToken, payload.chatToken);
		}
	}

	private getAgoraStreamingInfoFromStreamingInfo(streamingInfo: any) {
		return {
			appId: streamingInfo.streamingAppId,
			streamingUid: streamingInfo.streamingUid,
			videoChannelName: streamingInfo.videoChannelName,
			videoToken: streamingInfo.videoToken,
			chatChannelName: streamingInfo.chatChannelName,
			chatToken: streamingInfo.chatToken,
		} as AgoraStreamingInfo;
	}

	private getHostsFromStreamingInfo(streamingInfo: any) {
		const result: FiresideRTCHost[] = [];

		for (const field of ['hosts', 'unlistedHosts']) {
			const isUnlisted = field === 'unlistedHosts';
			if (!streamingInfo[field]) {
				continue;
			}

			const streamingUids = streamingInfo.streamingUids ?? [];
			const streamingHostIds = streamingInfo.streamingHostIds ?? {};
			const hostUsers = User.populate(streamingInfo[field] ?? []) as User[];
			const hosts = hostUsers.map(user => {
				return {
					user,
					isUnlisted,
					isLive: streamingHostIds.includes(user.id),
					uids: streamingUids[user.id] ?? [],
				} as FiresideRTCHost;
			});

			result.push(...hosts);
		}

		return result;
	}

	// TODO(big-pp-event) move this into controller somehow
	private destroyRtc() {
		const c = this.controller;
		if (!c.rtc.value) {
			return;
		}

		destroyFiresideRTC(c.rtc.value);
		c.rtc.value = undefined;
	}

	private onRetry() {
		this.disconnect();
		this.tryJoin();
	}

	async onGridUpdateFireside(payload: any) {
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
				// 'is_streaming',
				'is_draft',
				// can't updated member_count here for the same reason
				// we want update is_streaming.
				// 'member_count',
				'community_links',
			])
		);

		const wasHost = c.hosts.value.some(host => host.user.id === this.user?.id);

		// TODO(big-pp-event) check if this breaks reactivity.
		// I'm afraid of replacing an array instead of splicing and reinserting.
		c.hosts.value = this.getHostsFromStreamingInfo(payload.streaming_info);

		// After updating hosts need to check if we trasitioned into or out of being a host.
		const isHost = c.hosts.value.some(host => host.user.id === this.user?.id);

		// If our host state changed, we need to update anything else
		// depending on streaming.
		if (isHost !== wasHost) {
			// If we don't actually have an RTC created yet, take us through
			// the normal Host initialization.
			if (!c.rtc.value) {
				await this._fetchForStreaming({ assignRouteStatus: false });
				this.expiryCheck();
				return;
			}

			try {
				// Validate our streamingUid. If this fails, we're unable to stream.
				const response = await Api.sendRequest(
					'/web/dash/fireside/generate-streaming-tokens/' + c.fireside.id,
					{ streaming_uid: c.rtc.value.streamingUid },
					{ detach: true }
				);

				if (response?.success !== true) {
					throw new Error(response);
				}

				// Manually update our role to something where we can stream.
				if (c.fireside.role) {
					c.fireside.role.role = 'cohost';
					c.fireside.role.can_stream_audio = true;
					c.fireside.role.can_stream_video = true;
				}
			} catch (_) {
				// If our host state changed, downgrade ourselves to an audience member.
				if (!isHost && wasHost && c.fireside.role) {
					c.fireside.role.role = 'audience';
					c.fireside.role.can_stream_audio = false;
					c.fireside.role.can_stream_video = false;
				}
			}

			// TODO(big-pp-event) creating and destroying the producer is now done through
			// controller. We need a way to react to the producer being initialized and destroyed
			// in order to spawn the notification growls.
			// if (c.fireside.role?.canStream === true) {
			// 	// Grab a producer if we don't have one and we're now able
			// 	// to stream.
			// 	c.rtc.value.producer ??= createFiresideRTCProducer(c.rtc.value);
			// 	showInfoGrowl(
			// 		this.$gettext(
			// 			`You've been added as a host to this fireside. Hop into the stream!`
			// 		)
			// 	);
			// } else if (c.rtc.value.producer) {
			// 	// If our role doesn't allow us to stream and we have a
			// 	// producer, tear it down and clean it up.
			// 	await stopStreaming(c.rtc.value.producer);
			// 	cleanupFiresideRTCProducer(c.rtc.value.producer);
			// 	c.rtc.value.producer = null;

			// 	// TODO: If this Fireside was a draft, we may need to
			// 	// re-initialize this component to see if they still have
			// 	// permissions to view it.

			// 	showInfoGrowl(this.$gettext(`You've been removed as a host for this fireside.`));
			// }
		}

		this.expiryCheck();

		// // We don't update host streaming info through this. Only the audience
		// // streaming info is done through Grid.
		// // TODO(big-pp-event) why? then what causes the fireside RTC to self destruct for audience when there are no more hosts?
		// if (c.fireside.role?.canStream === true) {
		// 	return;
		// }

		// // TODO(big-pp-event) does is_streaming here have to be true only if listable hosts are streaming for the current user?
		// // EDIT: yes.
		// // TODO(big-pp-event) if this fireside updated event would end up creating the RTC, we need to make sure
		// // to fetch the user listable hosts set before actually creating it. Otherwise, we will get events from agora before
		// // we know which hosts are listable, which would end up creating everyone as muted.
		// if (c.fireside.is_streaming && payload.streaming_info) {
		// 	this.upsertRtc(payload.streaming_info, { hosts: newHosts });
		// } else {
		// 	this.destroyRtc();
		// }

		// OLD IMPLEMENTATION BELOW

		// console.log('Fireside update message:');
		// console.log(payload);

		// const c = this.controller;
		// if (!c.fireside || !payload.fireside) {
		// 	return;
		// }

		// const updatedFireside = new Fireside(payload.fireside);
		// const oldCommunityLinks = c.fireside.community_links;

		// for (const updatedLink of updatedFireside.community_links) {
		// 	const oldLink = oldCommunityLinks.find(
		// 		i => i.community.id === updatedLink.community.id
		// 	);
		// 	if (!oldLink) {
		// 		continue;
		// 	}
		// 	// Preserve the old Community model from the link, otherwise we will
		// 	// overwrite perms.
		// 	Object.assign(updatedLink, objectPick(oldLink, ['community']));
		// }

		// Object.assign(
		// 	c.fireside,
		// 	objectPick(updatedFireside, [
		// 		'user',
		// 		'header_media_item',
		// 		'title',
		// 		'expires_on',
		// 		'is_expired',
		// 		// TODO(big-pp-event) is_streaming can't be sent through fireside-updated
		// 		// event since this should be specific to the user now that we have unlisted hosts.
		// 		// 'is_streaming',
		// 		'is_draft',
		// 		// TODO(big-pp-event) same issue as above.
		// 		// 'member_count',
		// 		'community_links',
		// 	])
		// );

		// const priorHosts = c.rtc.value?.hosts ?? [];
		// const newHosts = this.getHostsFromStreamingInfo(payload.streaming_info)?.map(newHost => {
		// 	const priorHost = priorHosts.find(i => i.user.id === newHost.user.id);
		// 	if (priorHost) {
		// 		// Transfer over all previously assigned uids to the new host.
		// 		newHost.uids.push(...priorHost.uids);
		// 		arrayUnique(newHost.uids);
		// 	}
		// 	return newHost;
		// });

		// if (newHosts) {
		// 	const wasHost = priorHosts.some(host => host.user.id === this.user?.id);
		// 	const isHost = newHosts.some(host => host.user.id === this.user?.id);

		// 	if (c.rtc.value && newHosts.length > 0) {
		// 		// If we have an RTC, replace our old hosts with the new ones we
		// 		// just got.
		// 		c.rtc.value.hosts.splice(0, c.rtc.value.hosts.length);
		// 		c.rtc.value.hosts.push(...newHosts);
		// 	}

		// 	// If our host state changed, we need to update anything else
		// 	// depending on streaming.
		// 	if (isHost !== wasHost) {
		// 		// If we don't actually have an RTC created yet, take us through
		// 		// the normal Host initialization.
		// 		if (!c.rtc.value) {
		// 			await this._fetchForStreaming({ assignRouteStatus: false });
		// 			this.expiryCheck();
		// 			return;
		// 		}

		// 		try {
		// 			// Validate our streamingUid. If this fails, we're unable to
		// 			// stream.
		// 			const response = await Api.sendRequest(
		// 				'/web/dash/fireside/generate-streaming-tokens/' + c.fireside.id,
		// 				{ streaming_uid: c.rtc.value.streamingUid },
		// 				{ detach: true }
		// 			);

		// 			if (response?.success !== true) {
		// 				throw new Error(response);
		// 			}

		// 			// Manually update our role to something where we can stream.
		// 			if (c.fireside.role) {
		// 				c.fireside.role.role = 'cohost';
		// 				c.fireside.role.can_stream_audio = true;
		// 				c.fireside.role.can_stream_video = true;
		// 			}
		// 		} catch (_) {
		// 			// If our host state changed, downgrade ourselves to an audience member.
		// 			if (!isHost && wasHost && c.fireside.role) {
		// 				c.fireside.role.role = 'audience';
		// 				c.fireside.role.can_stream_audio = false;
		// 				c.fireside.role.can_stream_video = false;
		// 			}
		// 		}

		// 		if (c.fireside.role?.canStream === true) {
		// 			// Grab a producer if we don't have one and we're now able
		// 			// to stream.
		// 			c.rtc.value.producer ??= createFiresideRTCProducer(c.rtc.value);

		// 			showInfoGrowl(
		// 				this.$gettext(
		// 					`You've been added as a host to this fireside. Hop into the stream!`
		// 				)
		// 			);
		// 		} else if (c.rtc.value.producer) {
		// 			// If our role doesn't allow us to stream and we have a
		// 			// producer, tear it down and clean it up.
		// 			await stopStreaming(c.rtc.value.producer);
		// 			cleanupFiresideRTCProducer(c.rtc.value.producer);
		// 			c.rtc.value.producer = null;

		// 			// TODO: If this Fireside was a draft, we may need to
		// 			// re-initialize this component to see if they still have
		// 			// permissions to view it.

		// 			showInfoGrowl(
		// 				this.$gettext(`You've been removed as a host for this fireside.`)
		// 			);
		// 		}
		// 	}
		// }

		// this.expiryCheck();

		// // We don't update host streaming info through this. Only the audience
		// // streaming info is done through Grid.
		// // TODO(big-pp-event) why? then what causes the fireside RTC to self destruct for audience when there are no more hosts?
		// if (c.fireside.role?.canStream === true) {
		// 	return;
		// }

		// // TODO(big-pp-event) does is_streaming here have to be true only if listable hosts are streaming for the current user?
		// // EDIT: yes.
		// // TODO(big-pp-event) if this fireside updated event would end up creating the RTC, we need to make sure
		// // to fetch the user listable hosts set before actually creating it. Otherwise, we will get events from agora before
		// // we know which hosts are listable, which would end up creating everyone as muted.
		// if (c.fireside.is_streaming && payload.streaming_info) {
		// 	this.upsertRtc(payload.streaming_info, { hosts: newHosts });
		// } else {
		// 	this.destroyRtc();
		// }
	}

	onGridStreamingUidAdded(payload: any) {
		console.debug('[FIRESIDE] Grid streaming uid added.', payload);

		const c = this.controller;
		if (!c.rtc.value || !payload.streaming_uid || !payload.user) {
			return;
		}

		const user = new User(payload.user);
		const host = c.rtc.value.hosts.find(host => host.user.id === user.id);
		if (host) {
			host.user = user;
			if (host.uids.indexOf(payload.streaming_uid) === -1) {
				host.uids.push(payload.streaming_uid);
			}
		} else {
			c.rtc.value.hosts.push({
				user: user,
				isUnlisted: payload.is_unlisted,
				// TODO(big-pp-event) get this from the payload.
				isLive: false,
				uids: [payload.streaming_uid],
			});
		}
	}

	onGridStickerPlacement(payload: GridStickerPlacementPayload) {
		console.debug('[FIRESIDE] Grid sticker placement received.', payload, payload.streak);
		const c = this.controller;
		const placement = new StickerPlacement(payload.sticker_placement);

		setStickerStreak(this.drawerStore, placement.sticker, payload.streak);

		// This happens automatically when we're placing our own sticker. Ignore
		// it here so we don't do it twice.
		if (payload.user_id !== this.user?.id) {
			addStickerToTarget(c.stickerTargetController, placement);
			c.fireside.addStickerToCount(placement.sticker);
		}
	}

	onGridListableHosts(payload: { listable_host_ids?: number[] }) {
		console.debug('[FIRESIDE] Grid listable hosts.', payload);
		const c = this.controller;

		c.listableHostIds.value = payload.listable_host_ids ?? [];

		// TODO(big-pp-event) upsert fireside rtc here.

		if (c.rtc.value) {
			// TODO(big-pp-event) need to unfocus the current user if they are no longer listable.
			// This is not strictly needed for the event, but if its simple to implement why not eh?
			chooseFocusedRTCUser(c.rtc.value);
		}
	}
}
