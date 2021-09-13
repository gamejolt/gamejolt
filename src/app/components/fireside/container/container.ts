import Vue, { CreateElement } from 'vue';
import { Component, InjectReactive, Prop, ProvideReactive } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { objectPick } from '../../../../utils/object';
import { updateServerTimeOffset } from '../../../../utils/server-time';
import { sleep } from '../../../../utils/utils';
import { uuidv4 } from '../../../../utils/uuid';
import { Api } from '../../../../_common/api/api.service';
import { getCookie } from '../../../../_common/cookie/cookie.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresideRole } from '../../../../_common/fireside/role/role.model';
import {
	createFiresideRTC,
	destroyFiresideRTC,
	renewRTCAudienceTokens,
} from '../../../../_common/fireside/rtc/rtc';
import { Growls } from '../../../../_common/growls/growls.service';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { User } from '../../../../_common/user/user.model';
import { Store } from '../../../store';
import { StreamSetupModal } from '../../../views/fireside/_stream-setup/stream-setup-modal.service';
import { ChatStore, ChatStoreKey, clearChat, loadChat } from '../../chat/chat-store';
import { joinInstancedRoomChannel, leaveChatRoom, setGuestChatToken } from '../../chat/client';
import { EVENT_UPDATE, FiresideChannel } from '../../grid/fireside-channel';
import {
	FiresideController,
	FiresideControllerKey,
	updateFiresideExpiryValues,
} from '../controller/controller';

interface GridChannelJoinPayload {
	server_time: number;
}

@Component({})
export class AppFiresideContainer extends Vue {
	@ProvideReactive(FiresideControllerKey)
	@Prop({ type: FiresideController, required: true })
	controller!: FiresideController;

	@AppState user!: AppStore['user'];
	@State grid!: Store['grid'];
	@Action loadGrid!: Store['loadGrid'];

	@InjectReactive(ChatStoreKey)
	chatStore!: ChatStore;

	get chat() {
		return this.chatStore.chat;
	}

	created() {
		if (!this.$slots.default) {
			throw Error('AppFiresideContainer requires a default slot.');
		}

		this.controller.onRetry = this.onRetry;
	}

	render(h: CreateElement) {
		return h('div', {}, this.$slots.default);
	}

	async mounted() {
		const c = this.controller;
		c.chat = this.chat;

		// TODO: Do we want to do this?
		if (c.status === 'joined') {
			this.disconnect();
		}

		c.hasExpiryWarning = false;

		if (c.fireside.blocked) {
			c.status = 'blocked';
			console.debug(`[Fireside] Blocked from joining blocked user's Fireside.`);
			return;
		}

		this.setupExpiryInfoInterval();
		updateFiresideExpiryValues(c);

		if (c.fireside.isOpen()) {
			if (!this.grid) {
				this.loadGrid();
			}

			if (!this.chat) {
				loadChat(this.chatStore);
			}

			// Set up watchers to initiate connection once one of them boots up.
			this.$watch('chat.connected', () => this.watchChat());
			this.$watch('grid.connected', () => this.watchGrid());

			// Both services may already be connected (watchers wouldn't fire), so try joining manually now.
			this.tryJoin();
		} else {
			c.status = 'expired';
			console.debug(`[FIRESIDE] Fireside is expired, and cannot be joined.`);
		}
	}

	destroyed() {
		this.controller.onRetry = this.onRetry;

		this.destroyExpiryInfoInterval();
		this.disconnect();
		this.grid?.unsetGuestToken();

		if (this.chat?.isGuest) {
			clearChat(this.chatStore);
		}

		// This also happens in Disconnect, but make 100% sure we cleared the interval.
		this.clearExpiryCheck();
	}

	watchChat() {
		const c = this.controller;
		if (this.chat?.connected) {
			this.tryJoin();
		}
		// Only disconnect when not connected and it previous registered a different state.
		// This watcher runs once initially when chat is not connected, and we don't want to call
		// disconnect in that case.
		else if (c.chatPreviousConnectedState !== null) {
			this.disconnect();
		}

		c.chat = this.chat;
		c.chatPreviousConnectedState = this.chat?.connected === true;
	}

	watchGrid() {
		const c = this.controller;
		if (this.grid?.connected) {
			this.tryJoin();
		}
		// Only disconnect when not connected and it previous registered a different state.
		// This watcher runs once initially when grid is not connected, and we don't want to call
		// disconnect in that case.
		else if (this.grid && c.gridPreviousConnectedState !== null) {
			this.disconnect();
		}

		c.gridPreviousConnectedState = this.grid?.connected ?? null;
	}

	private async tryJoin() {
		const c = this.controller;

		// Only try to join when disconnected (or for the first "initial" load).
		if (c.status === 'disconnected' || c.status === 'initial') {
			c.status = 'loading';

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
		console.debug(`[FIRESIDE] Joining Fireside.`);
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
			c.status = 'setup-failed';
			return;
		}

		const authToken = await this.getAuthToken();
		if (!authToken) {
			console.debug(`[FIRESIDE] Setup failure 1.`);
			c.status = 'setup-failed';
			return;
		}

		// --- Refetch fireside information and check that it's not yet expired.

		try {
			const payload = await Api.sendRequest(
				`/web/fireside/fetch/${c.fireside.hash}`,
				undefined,
				{ detach: true }
			);

			if (!payload.fireside) {
				console.debug(`[FIRESIDE] Trying to load Fireside, but it was not found.`);
				c.status = 'setup-failed';
				return;
			}

			c.fireside.assign(payload.fireside);

			// If they have a host role, or if this fireside is actively
			// streaming, we'll get streaming tokens from the fetch payload. In
			// that case, we want to set up the RTC stuff.
			this.createOrUpdateRtc(payload, false);
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 2.`, error);
			c.status = 'setup-failed';
			return;
		}

		// Maybe they are blocked now?
		if (c.fireside.blocked) {
			c.status = 'blocked';
			console.debug(`[Fireside] Blocked from joining blocked user's Fireside.`);
			return;
		}

		// Make sure it's still joinable.
		if (!c.fireside.isOpen()) {
			console.debug(`[FIRESIDE] Fireside is expired, and cannot be joined.`);
			c.status = 'expired';
			return;
		}

		// --- Make them join the Fireside (if they aren't already).

		if (this.user && !c.fireside.role) {
			const rolePayload = await Api.sendRequest(`/web/fireside/join/${c.fireside.hash}`);
			if (!rolePayload || !rolePayload.success || !rolePayload.role) {
				console.debug(`[FIRESIDE] Failed to acquire a role.`);
				c.status = 'setup-failed';
				return;
			}
			c.fireside.role = new FiresideRole(rolePayload.role);
		}

		// --- Join Grid channel.

		const channel = new FiresideChannel(c.fireside, this.grid.socket, this.user, authToken);

		// Subscribe to the update event.
		channel.on(EVENT_UPDATE, this.onGridUpdateFireside.bind(this));

		try {
			await new Promise<void>((resolve, reject) => {
				channel
					.join()
					.receive('error', reject)
					.receive('ok', (payload: GridChannelJoinPayload) => {
						if (payload.server_time) {
							updateServerTimeOffset(payload.server_time);
						}

						c.gridChannel = channel;
						this.grid!.channels.push(channel);
						resolve();
					});
			});
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 3.`, error);
			if (error && error.reason === 'blocked') {
				c.status = 'blocked';
			} else {
				c.status = 'setup-failed';
			}
			return;
		}

		// Now join the chat's room channel.
		try {
			const chatChannel = await joinInstancedRoomChannel(this.chat, c.fireside.chat_room_id);

			if (!chatChannel) {
				console.debug(`[FIRESIDE] Setup failure 4.`);
				c.status = 'setup-failed';
				return;
			}

			c.chatChannel = chatChannel;
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 5.`, error);
			c.status = 'setup-failed';
			return;
		}

		c.chatChannel.on('kick_member', (data: any) => {
			if (this.user && data.user_id === this.user.id) {
				Growls.info(this.$gettext(`You've been kicked from the Fireside.`));
				this.$router.push({ name: 'home' });
			}
		});

		c.status = 'joined';
		console.debug(`[FIRESIDE] Successfully joined Fireside.`);

		// Set up the expiry interval to check if the Fireside is expired.
		this.clearExpiryCheck();
		c.expiryInterval = setInterval(this.expiryCheck.bind(this), 1000);
		this.expiryCheck();
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
		if (!c || c.status === 'disconnected') {
			return;
		}

		console.debug(`[FIRESIDE] Disconnecting from Fireside.`);
		c.status = 'disconnected';

		if (this.grid && this.grid.connected && c.gridChannel) {
			c.gridChannel.leave();
		}

		c.gridChannel = null;

		if (this.chat && this.chat.connected && c.chatChannel) {
			leaveChatRoom(this.chat, c.chatChannel.room);
		}

		c.chatChannel = null;
		StreamSetupModal.close();
		this.destroyRtc();
		this.clearExpiryCheck();

		console.debug(`[FIRESIDE] Disconnected from Fireside.`);
	}

	private clearExpiryCheck() {
		const c = this.controller;
		if (c.expiryInterval) {
			clearInterval(c.expiryInterval);
			c.expiryInterval = null;
		}
	}

	private expiryCheck() {
		const c = this.controller;
		if (!c || c.status !== 'joined' || !c.fireside) {
			return;
		}

		if (!c.fireside.isOpen()) {
			this.disconnect();
			c.status = 'expired';
		}
	}

	private destroyExpiryInfoInterval() {
		const c = this.controller;
		if (c.updateInterval) {
			clearInterval(c.updateInterval);
			c.updateInterval = null;
		}
	}

	private setupExpiryInfoInterval() {
		const c = this.controller;
		this.destroyExpiryInfoInterval();
		c.updateInterval = setInterval(() => updateFiresideExpiryValues(c), 1000);
	}

	private createOrUpdateRtc(payload: any, checkJoined = true) {
		const c = this.controller;
		if (!c || !c.fireside || (checkJoined && c.status !== 'joined')) {
			return;
		}

		// If they don't have tokens yet, then they don't need to set up the RTC
		// stuff.
		if (!payload.videoToken || !payload.chatToken) {
			return;
		}

		const hosts = User.populate(payload.hosts ?? []);

		if (c.rtc === null) {
			c.rtc = createFiresideRTC(
				c.fireside,
				c.fireside.role,
				this.user?.id ?? null,
				payload.streamingAppId,
				payload.videoChannelName,
				payload.videoToken,
				payload.chatChannelName,
				payload.chatToken,
				hosts,
				c.muteUsers
			);
		} else {
			// TODO: update hosts when we introduce changing hosts on the fly.
			renewRTCAudienceTokens(c.rtc, payload.videoToken, payload.chatToken);
		}
	}

	private destroyRtc() {
		const c = this.controller;
		if (!c.rtc) {
			return;
		}

		destroyFiresideRTC(c.rtc);
		c.rtc = null;
	}

	private onRetry() {
		this.disconnect();
		this.tryJoin();
	}

	onGridUpdateFireside(payload: any) {
		const c = this.controller;
		if (!c.fireside || !payload.fireside) {
			return;
		}

		const updated = new Fireside(payload.fireside);
		Object.assign(
			c.fireside,
			objectPick(updated, [
				'user',
				'header_media_item',
				'title',
				'expires_on',
				'is_expired',
				'is_streaming',
				'is_draft',
				'member_count',
			])
		);

		this.expiryCheck();

		// We don't update host streaming info through this. Only the audience
		// streaming info is done through Grid.
		if (c.fireside.role?.canStream === true) {
			return;
		}

		if (c.fireside.is_streaming && payload.streaming_info) {
			this.createOrUpdateRtc(payload.streaming_info);
		} else {
			this.destroyRtc();
		}
	}
}
