import Component from 'vue-class-component';
import { InjectReactive, ProvideReactive, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { getAbsoluteLink } from '../../../utils/router';
import { sleep } from '../../../utils/utils';
import { trackExperimentEngagement } from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import AppAuthJoin from '../../../_common/auth/join/join.vue';
import AppCommunityThumbnailImg from '../../../_common/community/thumbnail/img/img.vue';
import { configShareCard } from '../../../_common/config/config.service';
import { getCookie } from '../../../_common/cookie/cookie.service';
import { number } from '../../../_common/filters/number';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { FiresideRole } from '../../../_common/fireside/role/role.model';
import { Growls } from '../../../_common/growls/growls.service';
import AppIllustration from '../../../_common/illustration/illustration.vue';
import AppLoading from '../../../_common/loading/loading.vue';
import { Meta } from '../../../_common/meta/meta-service';
import { AppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import AppPopper from '../../../_common/popper/popper.vue';
import { AppResponsiveDimensions } from '../../../_common/responsive-dimensions/responsive-dimensions';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollScroller from '../../../_common/scroll/scroller/scroller.vue';
import { copyShareLink } from '../../../_common/share/share.service';
import { AppState, AppStore } from '../../../_common/store/app-store';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../_common/user/user-avatar/img/img.vue';
import { User } from '../../../_common/user/user.model';
import {
	ChatClient,
	ChatKey,
	joinInstancedRoomChannel,
	leaveChatRoom,
} from '../../components/chat/client';
import { ChatRoomChannel } from '../../components/chat/room-channel';
import AppChatWindowOutput from '../../components/chat/window/output/output.vue';
import AppChatWindowSend from '../../components/chat/window/send/send.vue';
import { EVENT_UPDATE, FiresideChannel } from '../../components/grid/fireside-channel';
import { store, Store } from '../../store';
import { FiresideHostRtc } from './fireside-host-rtc';
import {
	destroyFiresideRTC,
	FiresideRTC,
	FiresideRTCKey,
	renewFiresideRTCToken,
} from './fireside-rtc';
import AppFiresideChatMembers from './_chat-members/chat-members.vue';
import { FiresideChatMembersModal } from './_chat-members/modal/modal.service';
import { FiresideController, FiresideControllerKey } from './controller';
import { FiresideEditModal } from './_edit-modal/edit-modal.service';
import AppFiresideHostList from './_host-list/host-list.vue';
import { FiresideStatsModal } from './_stats/modal/modal.service';
import AppFiresideStats from './_stats/stats.vue';
import AppFiresideShare from './_stats/_share/share.vue';
import { StreamSetupModal } from './_stream-setup/stream-setup-modal.service';
import AppFiresideStream from './_stream/stream.vue';

type RoutePayload = {
	fireside: any;
	streamingAppId: string;
	videoChannelName: string;
	videoToken: string | null;
	audioChatChannelName: string;
	audioChatToken: string | null;
	hosts: any[];
	metaDescription: string;
	fb: any;
	twitter: any;
};

export type RouteStatus =
	| 'initial' // Initial status when route loads.
	| 'disconnected' // Disconnected from the Fireside (chat/client channels).
	| 'loading' // Initiated loading to connect to relevant channels.
	| 'unauthorized' // Cannot join because user is not logged in/has no cookie.
	| 'expired' // Fireside has expired.
	| 'setup-failed' // Failed to properly join the Fireside.
	| 'joined' // Currently joined to the Fireside.
	| 'blocked'; // Blocked from joining the Fireside (user blocked).

const FiresideThemeKey = 'fireside';

@Component({
	name: 'RouteFireside',
	components: {
		AppUserAvatarImg,
		AppLoading,
		AppChatWindowOutput,
		AppChatWindowSend,
		AppIllustration,
		AppAuthJoin,
		AppFiresideChatMembers,
		AppFiresideStats,
		AppCommunityThumbnailImg,
		AppResponsiveDimensions,
		AppFiresideStream,
		AppScrollScroller,
		AppFiresideHostList,
		AppPopper,
		AppFiresideShare,
	},
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
@RouteResolver({
	deps: { params: ['hash'] },
	resolver: ({ route }) => Api.sendRequest(`/web/fireside/fetch/${route.params.hash}?meta=1`),
	lazy: true,
})
export default class RouteFireside extends BaseRouteComponent {
	@AppState user!: AppStore['user'];
	@State grid!: Store['grid'];
	@InjectReactive(ChatKey) chat!: ChatClient;
	@ProvideReactive(FiresideRTCKey) rtc: FiresideRTC | null = null;
	@ProvideReactive(FiresideControllerKey) c: FiresideController = new FiresideController();

	private beforeEachDeregister: Function | null = null;

	private streamingAppId: string | null = null;
	private gridChannel: FiresideChannel | null = null;
	private chatChannel: ChatRoomChannel | null = null;
	private expiryInterval: NodeJS.Timer | null = null;
	private chatPreviousConnectedState: boolean | null = null;
	private gridPreviousConnectedState: boolean | null = null;
	status: RouteStatus = 'initial';
	hasExpiryWarning = false; // Visually shows a warning to the owner when the fireside's time is running low.

	hostRtc: FiresideHostRtc | null = null;

	readonly Screen = Screen;
	readonly number = number;

	videoWidth = 0;
	videoHeight = 0;
	isVertical = false;

	$refs!: {
		videoWrapper: HTMLDivElement;
	};

	get fireside() {
		return this.c.fireside;
	}

	get shareUrl() {
		if (!this.fireside) {
			return;
		}
		return getAbsoluteLink(this.$router, this.fireside.location);
	}

	get routeTitle() {
		if (!this.fireside) {
			return this.$gettext(`Loading Fireside...`);
		}

		return this.fireside.title + ' - Fireside';
	}

	get isDraft() {
		return this.fireside?.is_draft ?? true;
	}

	get chatRoom() {
		return this.chatChannel?.room;
	}

	get chatMessages() {
		if (!this.chatRoom) {
			return [];
		}

		return this.chat.messages[this.chatRoom.id];
	}

	get chatQueuedMessages() {
		if (!this.chatRoom) {
			return [];
		}

		return this.chat.messageQueue.filter(i => i.room_id === this.chatRoom!.id);
	}

	get overlayChatMembers() {
		if (this.shouldShowHosts) {
			return;
		}
		return this.chatUsers;
	}

	get chatUsers() {
		if (!this.chatRoom) {
			return undefined;
		}
		return this.chat.roomMembers[this.chatRoom.id];
	}

	get isStreaming() {
		return !!(this.fireside?.is_streaming && this.rtc && this.rtc.users.length > 0);
	}

	get shouldShowChat() {
		const mobileCondition = Screen.isMobile && this.isStreaming ? this.isVertical : true;
		return !!this.chat && this.chat.connected && !!this.chatRoom && mobileCondition;
	}

	get shouldShowChatMembers() {
		return !this.isStreaming && this.shouldShowChat && Screen.isLg;
	}

	get shouldShowChatMemberStats() {
		return this.shouldShowHosts && this.isStreaming;
	}

	get shouldShowHosts() {
		return !this.isVertical && !Screen.isMobile;
	}

	get shouldShowFiresideStats() {
		return !this.isStreaming && this.status === 'joined' && !Screen.isMobile;
	}

	get shouldShowEditControlButton() {
		return (
			this.status === 'joined' &&
			this.user &&
			this.fireside &&
			(this.user.id === this.fireside.user.id ||
				this.fireside.community?.hasPerms('community-firesides'))
		);
	}

	get shouldShowTitleControls() {
		return (
			this.status === 'joined' &&
			(!this.shouldShowChatMembers ||
				!this.shouldShowFiresideStats ||
				this.shouldShowEditControlButton)
		);
	}

	get shouldShowStreamingOptions() {
		return this.canStream || this.isPersonallyStreaming;
	}

	get canStream() {
		return (
			!!this.hostRtc && (Screen.isDesktop || (this.user && this.user.permission_level >= 4))
		);
	}

	get isPersonallyStreaming() {
		return this.hostRtc?.isStreaming ?? false;
	}

	onClickEditStream() {
		if (this.hostRtc) {
			StreamSetupModal.show(this.hostRtc);
		}
	}

	onClickStopStreaming() {
		this.hostRtc?.stopStreaming();
	}

	toggleVideoStats() {
		this.rtc!.shouldShowVideoStats = !this.rtc!.shouldShowVideoStats;
	}

	async routeResolved($payload: RoutePayload) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = $payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		if (this.status === 'joined') {
			this.disconnect();
		}

		this.streamingAppId = $payload.streamingAppId;
		this.c.fireside = new Fireside($payload.fireside);
		this.hasExpiryWarning = false;
		this.setPageTheme();

		const userCanJoin = await this.checkUserCanJoin();

		if (!userCanJoin) {
			this.status = 'unauthorized';
			console.debug(
				`[FIRESIDE] User is not authorized to join the Fireside (not logged in/no cookie).`
			);
			return;
		}

		if (this.c.fireside.blocked) {
			this.status = 'blocked';
			console.debug(`[Fireside] Blocked from joining blocked user's Fireside.`);
			return;
		}

		if (this.c.fireside.isOpen()) {
			// Set up watchers to initiate connection once one of them boots up.
			this.$watch('chat.connected', () => this.watchChat());
			this.$watch('grid.connected', () => this.watchGrid());

			// Both services may already be connected (watchers wouldn't fire), so try joining manually now.
			this.tryJoin();
		} else {
			this.status = 'expired';
			console.debug(`[FIRESIDE] Fireside is expired, and cannot be joined.`);
		}
	}

	routeDestroyed() {
		store.commit('theme/clearPageTheme', FiresideThemeKey);

		this.disconnect();

		if (this.beforeEachDeregister) {
			this.beforeEachDeregister();
			this.beforeEachDeregister = null;
		}

		// This also happens in Disconnect, but make 100% sure we cleared the interval.
		this.clearExpiryCheck();
	}

	private async tryJoin() {
		// Only try to join when disconnected (or for the first "initial" load).
		if (this.status === 'disconnected' || this.status === 'initial') {
			this.status = 'loading';

			// Make sure the services are connected.
			while (!this.grid || !this.grid.connected) {
				console.debug('[FIRESIDE] Wait for Grid...');
				await sleep(250);
			}
			while (!this.chat || !this.chat.connected) {
				console.debug('[FIRESIDE] Wait for Chat...');
				await sleep(250);
			}

			this.join();
		}
	}

	calcIsVertical() {
		if (Screen.isMobile) {
			this.isVertical = window.screen.height > window.screen.width;
		} else {
			this.isVertical = Screen.height > Screen.width;
		}
	}

	onDimensionsChange() {
		this.calcIsVertical();

		const videoWrapper = this.$refs.videoWrapper;
		if (!videoWrapper) {
			return;
		}

		const wrapperWidth = videoWrapper.offsetWidth;
		const wrapperHeight = videoWrapper.offsetHeight;
		const wrapperRatio = wrapperWidth / wrapperHeight;

		const videoStats = this.rtc?.videoClient?.getRemoteVideoStats();
		const receiveWidth = videoStats?.receiveResolutionWidth?.receiveResolutionWidth ?? 16;
		const receiveHeight = videoStats?.receiveResolutionHeight?.receiveResolutionHeight ?? 9;
		const receiveRatio = receiveWidth / receiveHeight;

		// If the video is wider than the containing element...
		if (receiveRatio > wrapperRatio) {
			this.videoWidth = wrapperWidth;
			this.videoHeight = wrapperWidth / receiveRatio;
		} else if (receiveRatio < wrapperRatio) {
			this.videoHeight = wrapperHeight;
			this.videoWidth = wrapperHeight * receiveRatio;
		} else {
			this.videoWidth = wrapperWidth;
			this.videoHeight = wrapperHeight;
		}
	}

	watchChat() {
		if (this.chat.connected) {
			this.tryJoin();
		}
		// Only disconnect when not connected and it previous registered a different state.
		// This watcher runs once initially when chat is not connected, and we don't want to call
		// disconnect in that case.
		else if (this.chatPreviousConnectedState !== null) {
			this.disconnect();
		}

		this.chatPreviousConnectedState = this.chat.connected;
	}

	watchGrid() {
		if (this.grid && this.grid.connected) {
			this.tryJoin();
		}
		// Only disconnect when not connected and it previous registered a different state.
		// This watcher runs once initially when grid is not connected, and we don't want to call
		// disconnect in that case.
		else if (this.grid && this.gridPreviousConnectedState !== null) {
			this.disconnect();
		}

		this.gridPreviousConnectedState = this.grid?.connected ?? null;
	}

	private setPageTheme() {
		const theme = this.fireside?.community?.theme ?? this.fireside?.user?.theme ?? null;
		store.commit('theme/setPageTheme', { key: FiresideThemeKey, theme });
	}

	private async checkUserCanJoin() {
		if (!this.user) {
			return false;
		}

		const frontendCookie = await getCookie('frontend');

		if (!frontendCookie) {
			return false;
		}

		return true;
	}

	private async join() {
		console.debug(`[FIRESIDE] Joining Fireside.`);

		// --- Make sure common join conditions are met.

		if (!this.user) {
			console.debug(`[FIRESIDE] User is not logged in.`);
			this.status = 'unauthorized';
			return;
		}

		if (
			!this.fireside ||
			!this.grid ||
			!this.grid.connected ||
			!this.grid.socket ||
			!this.chat ||
			!this.chat.connected
		) {
			console.debug(`[FIRESIDE] General connection error.`);
			this.status = 'setup-failed';
			return;
		}

		const frontendCookie = await getCookie('frontend');
		if (!frontendCookie) {
			console.debug(`[FIRESIDE] Setup failure 1.`);
			this.status = 'setup-failed';
			return;
		}

		// --- Refetch fireside information and check that it's not yet expired.

		try {
			const payload = await Api.sendRequest(
				`/web/fireside/fetch/${this.$route.params.hash}`,
				undefined,
				{ detach: true }
			);
			if (!payload.fireside) {
				console.debug(`[FIRESIDE] Trying to load Fireside, but it was not found.`);
				this.status = 'setup-failed';
				return;
			}
			this.streamingAppId = payload.streamingAppId;
			this.c.fireside = new Fireside(payload.fireside);
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 2.`, error);
			this.status = 'setup-failed';
			return;
		}

		// Maybe they are blocked now?
		if (this.fireside.blocked) {
			this.status = 'blocked';
			console.debug(`[Fireside] Blocked from joining blocked user's Fireside.`);
			return;
		}

		// Make sure it's still joinable.
		if (!this.fireside.isOpen()) {
			console.debug(`[FIRESIDE] Fireside is expired, and cannot be joined.`);
			this.status = 'expired';
			return;
		}

		// --- Make them join the Fireside (if they aren't already).

		if (!this.fireside.role) {
			const rolePayload = await Api.sendRequest(`/web/fireside/join/${this.fireside.hash}`);
			if (!rolePayload || !rolePayload.success || !rolePayload.role) {
				console.debug(`[FIRESIDE] Failed to acquire a role.`);
				this.status = 'setup-failed';
				return;
			}
			this.fireside.role = new FiresideRole(rolePayload.role);
		}

		if (this.streamingAppId && this.fireside.role.canStream) {
			this.hostRtc = new FiresideHostRtc(
				this.streamingAppId,
				this.user.id,
				this.fireside.id,
				this.fireside.role
			);
		}

		// --- Join Grid channel.

		const channel = new FiresideChannel(
			this.fireside,
			this.grid.socket,
			this.user,
			frontendCookie
		);

		// Subscribe to the update event.
		channel.on(EVENT_UPDATE, this.onGridUpdateFireside.bind(this));

		try {
			await new Promise<void>((resolve, reject) => {
				channel
					.join()
					.receive('error', reject)
					.receive('ok', () => {
						this.gridChannel = channel;
						this.grid!.channels.push(channel);
						resolve();
					});
			});
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 3.`, error);
			if (error && error.reason === 'blocked') {
				this.status = 'blocked';
			} else {
				this.status = 'setup-failed';
			}
			return;
		}

		// Now join the chat's room channel.
		try {
			const chatChannel = await joinInstancedRoomChannel(
				this.chat,
				this.fireside.chat_room_id
			);

			if (!chatChannel) {
				console.debug(`[FIRESIDE] Setup failure 4.`);
				this.status = 'setup-failed';
				return;
			}

			this.chatChannel = chatChannel;
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 5.`, error);
			this.status = 'setup-failed';
			return;
		}

		this.chatChannel.on('kick_member', (data: any) => {
			if (data.user_id === this.user!.id) {
				Growls.info(this.$gettext(`You've been kicked from the Fireside.`));
				this.$router.push({ name: 'home' });
			}
		});

		// Now join the RTC.
		if (this.fireside.is_streaming) {
			const streamingPayload = await Api.sendRequest(
				`/web/fireside/fetch-streaming-info/${this.fireside.hash}`
			);
			this.createOrUpdateRtc(streamingPayload, false);
		}

		this.status = 'joined';
		console.debug(`[FIRESIDE] Successfully joined Fireside.`);

		// Set up the expiry interval to check if the Fireside is expired.
		this.clearExpiryCheck();
		this.expiryInterval = setInterval(this.expiryCheck.bind(this), 1000);
		this.expiryCheck();
	}

	private disconnect() {
		if (this.status === 'disconnected') {
			return;
		}

		console.debug(`[FIRESIDE] Disconnecting from Fireside.`);

		this.status = 'disconnected';

		this.hostRtc?.destroy();
		this.hostRtc = null;

		if (this.grid && this.grid.connected && this.gridChannel) {
			this.gridChannel.leave();
		}

		this.gridChannel = null;

		if (this.chat && this.chat.connected && this.chatChannel) {
			leaveChatRoom(this.chat, this.chatChannel.room);
		}

		this.chatChannel = null;

		StreamSetupModal.close();

		this.destroyRtc();

		this.clearExpiryCheck();

		console.debug(`[FIRESIDE] Disconnected from Fireside.`);
	}

	private clearExpiryCheck() {
		if (this.expiryInterval) {
			clearInterval(this.expiryInterval);
			this.expiryInterval = null;
		}
	}

	private expiryCheck() {
		if (this.status !== 'joined' || !this.fireside) {
			return;
		}

		if (!this.fireside.isOpen()) {
			this.disconnect();
			this.status = 'expired';
		}

		// Shows an expiry warning on the stats icon (on mobile) when < 60 seconds remain.
		this.hasExpiryWarning = this.fireside.getExpiryInMs() < 60_000;
	}

	private createOrUpdateRtc(payload: any, checkJoined = true) {
		if (!this.user || !this.fireside || (checkJoined && this.status !== 'joined')) {
			return;
		}

		const hosts = User.populate(payload.hosts ?? []);

		if (this.rtc === null) {
			this.rtc = new FiresideRTC(
				this.user.id,
				payload.streamingAppId,
				payload.videoChannelName,
				payload.videoToken,
				payload.audioChatChannelName,
				payload.audioChatToken,
				hosts
			);
		} else {
			// TODO: update hosts when we introduce changing hosts on the fly.
			renewFiresideRTCToken(this.rtc, payload.videoToken, payload.audioChatToken);
		}
	}

	private destroyRtc() {
		if (!this.rtc) {
			return;
		}

		destroyFiresideRTC(this.rtc);

		this.rtc = null;
	}

	onClickRetry() {
		this.disconnect();
		this.tryJoin();
	}

	onClickCopyLink() {
		if (!this.fireside) {
			return;
		}
		const url = getAbsoluteLink(this.$router, this.fireside.location);
		copyShareLink(url, 'fireside');
	}

	onClickShowChatMembers() {
		if (!this.chatUsers || !this.chatRoom) {
			return;
		}
		FiresideChatMembersModal.show(this.chatUsers, this.chatRoom);
	}

	onClickShowFiresideStats() {
		if (!this.fireside) {
			return;
		}
		FiresideStatsModal.show(this.c, this.status, this.hostRtc, this.isStreaming);
	}

	onClickEditFireside() {
		if (!this.fireside) {
			return;
		}
		FiresideEditModal.show(this.fireside);
	}

	onGridUpdateFireside(payload: any) {
		if (!this.fireside || !payload.fireside) {
			return;
		}

		this.fireside.assign(payload.fireside);
		this.expiryCheck();

		if (this.fireside.is_streaming && payload.streaming_info) {
			this.createOrUpdateRtc(payload.streaming_info);
		} else {
			this.destroyRtc();
		}
	}

	@Watch('isPersonallyStreaming')
	onIsPersonallyStreamingChanged() {
		if (this.isPersonallyStreaming) {
			this.beforeEachDeregister ??= this.$router.beforeEach((_to, _from, next) => {
				if (
					!window.confirm(
						this.$gettext(
							`You are currently streaming to a Fireside. If you leave this page, you will stop streaming. Are you sure you want to leave?`
						)
					)
				) {
					return next(false);
				}
				next();
			});
		} else {
			if (this.beforeEachDeregister) {
				this.beforeEachDeregister();
				this.beforeEachDeregister = null;
			}
		}
	}

	@Watch('isDraft')
	onIsDraftChanged() {
		// We try not to show sharing information while in draft, since links
		// will redirect them if they don't have permissions.
		if (this.isDraft) {
			return;
		}
		trackExperimentEngagement(configShareCard);
	}
}
