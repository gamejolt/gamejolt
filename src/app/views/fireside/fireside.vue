<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options, Watch } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { Api } from '../../../_common/api/api.service';
import AppFadeCollapse from '../../../_common/AppFadeCollapse.vue';
import { vAppAuthRequired } from '../../../_common/auth/auth-required-directive';
import AppAuthJoin from '../../../_common/auth/join/join.vue';
import { useDrawerStore } from '../../../_common/drawer/drawer-store';
import { Environment } from '../../../_common/environment/environment.service';
import AppExpand from '../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../_common/filters/number';
import { Fireside } from '../../../_common/fireside/fireside.model';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../_common/loading/loading.vue';
import { Meta } from '../../../_common/meta/meta-service';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import { Popper } from '../../../_common/popper/popper.service';
import AppPopper from '../../../_common/popper/popper.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';
import AppStickerReactions from '../../../_common/sticker/reactions/reactions.vue';
import AppStickerTarget from '../../../_common/sticker/target/target.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { useThemeStore } from '../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../_common/translate/translate.service';
import AppUserAvatarImg from '../../../_common/user/user-avatar/img/img.vue';
import { ChatStore, ChatStoreKey } from '../../components/chat/chat-store';
import AppChatWindowOutput from '../../components/chat/window/output/output.vue';
import AppChatWindowSend from '../../components/chat/window/send/send.vue';
import { AppFiresideContainer } from '../../components/fireside/container/container';
import {
	createFiresideController,
	FiresideController,
	getFiresideLink,
	toggleStreamVideoStats,
} from '../../components/fireside/controller/controller';
import { illEndOfFeed, illMaintenance, illNoCommentsSmall } from '../../img/ill/illustrations';
import AppFiresideBanner from './_banner/banner.vue';
import AppFiresideChatMembers from './_chat-members/AppFiresideChatMembers.vue';
import AppFiresideHeader from './_header/header.vue';
import AppFiresideHostList from './_host-list/host-list.vue';
import AppFiresideShare from './_share/share.vue';
import AppFiresideStats from './_stats/stats.vue';
import AppFiresideStream from './_stream/stream.vue';

type RoutePayload = {
	fireside: any;
	metaDescription: string;
	fb: any;
	twitter: any;
};

const FiresideThemeKey = 'fireside';

@Options({
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
		AppFiresideStream,
		AppScrollScroller,
		AppFiresideHostList,
		AppPopper,
		AppFiresideShare,
		AppExpand,
		AppFiresideHeader,
		AppFiresideContainer,
		AppFiresideBanner,
		AppStickerTarget,
		AppStickerReactions,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppObserveDimensions: vAppObserveDimensions,
		AppAuthRequired: vAppAuthRequired,
	},
})
@OptionsForRoute({
	deps: { params: ['hash'] },
	resolver: ({ route }) => Api.sendRequest(`/web/fireside/fetch/${route.params.hash}?meta=1`),
	lazy: true,
})
export default class RouteFireside extends BaseRouteComponent {
	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	drawerStore = shallowSetup(() => useDrawerStore());

	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());

	get user() {
		return this.commonStore.user;
	}

	c: FiresideController | null = shallowSetup(() => null);

	private beforeEachDeregister: (() => void) | null = null;
	private canShowMobileHosts = true;

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;
	readonly toggleStreamVideoStats = toggleStreamVideoStats;
	readonly illNoCommentsSmall = illNoCommentsSmall;
	readonly illMaintenance = illMaintenance;
	readonly illEndOfFeed = illEndOfFeed;

	videoWidth = 0;
	videoHeight = 0;
	isVertical = false;

	declare $refs: {
		videoWrapper: HTMLDivElement;
	};

	get loginUrl() {
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get chat() {
		return this.chatStore.chat;
	}

	get fireside() {
		return this.c?.fireside;
	}

	get routeTitle() {
		if (!this.fireside) {
			return $gettext(`Loading Fireside...`);
		}

		return this.fireside.title + ' - Fireside';
	}

	get chatMessages() {
		if (!this.chat || !this.c?.chatRoom.value) {
			return [];
		}

		return this.chat.messages[this.c.chatRoom.value.id];
	}

	get chatQueuedMessages() {
		if (!this.chat || !this.c?.chatRoom.value) {
			return [];
		}

		return this.chat.messageQueue.filter(i => i.room_id === this.c?.chatRoom.value?.id);
	}

	get shouldFullscreenStream() {
		if (!this.c?.isStreaming.value) {
			return false;
		}
		return Screen.isXs && !this.shouldShowChat && !this.isVertical;
	}

	get shouldShowHeaderInBody() {
		return this.isVertical && !!this.c?.isStreaming.value;
	}

	get shouldShowChat() {
		const mobileCondition =
			Screen.isMobile && this.c?.isStreaming.value ? this.isVertical : true;

		return Boolean(this.chat?.connected && this.c?.chatRoom.value && mobileCondition);
	}

	get shouldShowChatMembers() {
		return !this.c?.isStreaming.value && this.shouldShowChat && Screen.isLg;
	}

	get shouldShowChatMemberStats() {
		return this.shouldShowDesktopHosts && !!this.c?.isStreaming.value;
	}

	get shouldShowDesktopHosts() {
		return !this.isVertical && !Screen.isMobile;
	}

	get shouldShowMobileHosts() {
		return this.canShowMobileHosts && !!this.c?.isStreaming.value;
	}

	get shouldShowReactions() {
		return !Screen.isMobile;
	}

	get shouldShowFiresideStats() {
		return !this.c?.isStreaming.value && this.c?.status.value === 'joined' && !Screen.isMobile;
	}

	get shortestSide() {
		return Math.min(Screen.width, Screen.height);
	}

	async routeResolved($payload: RoutePayload) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = $payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		const fireside = new Fireside($payload.fireside);
		this.c ??= createFiresideController(fireside);

		this.setPageTheme();
	}

	routeDestroyed() {
		this.c?.cleanup();
		this.themeStore.clearPageTheme(FiresideThemeKey);

		this.beforeEachDeregister?.();
		this.beforeEachDeregister = null;
	}

	calcIsVertical() {
		if (Screen.isMobile && !import.meta.env.SSR) {
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

		const videoStats = this.c?.rtc.value?.videoChannel.agoraClient.getRemoteVideoStats();
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

	private setPageTheme() {
		const theme = this.fireside?.user?.theme ?? null;
		this.themeStore.setPageTheme({ key: FiresideThemeKey, theme });
	}

	get shouldShowTitleControls() {
		return this.c?.status.value === 'joined';
	}

	toggleVideoStats() {
		if (this.c) {
			toggleStreamVideoStats(this.c);
			Popper.hideAll();
		}
	}

	onClickRetry() {
		if (this.c?.onRetry.value) {
			this.c.onRetry.value();
		}
	}

	onClickOpenBrowser() {
		if (!this.c) {
			return;
		}

		const url = getFiresideLink(this.c, this.$router);
		if (url) {
			Navigate.newWindow(url);
		}
	}

	onChatEditorFocusChange(isFocused: boolean) {
		this.canShowMobileHosts = !isFocused;
	}

	@Watch('c.isPersonallyStreaming.value')
	onIsPersonallyStreamingChanged() {
		if (import.meta.env.SSR) {
			return;
		}

		if (!this.c || this.c.isPersonallyStreaming.value) {
			this.beforeEachDeregister ??= this.$router.beforeEach((_to, _from, next) => {
				if (
					!window.confirm(
						$gettext(
							`You are currently streaming to a fireside. If you leave this page, you will stop streaming. Are you sure you want to leave?`
						)
					)
				) {
					return next(false);
				}
				next();
			});
		} else {
			this.beforeEachDeregister?.();
			this.beforeEachDeregister = null;
		}
	}
}
</script>

<template>
	<AppFiresideContainer v-if="c" :controller="c" class="-fireside">
		<AppFiresideBanner />

		<template v-if="!shouldShowHeaderInBody">
			<AppFiresideHeader
				class="-header"
				:show-controls="shouldShowTitleControls"
				:has-chat="!shouldShowChatMembers"
				:has-chat-stats="shouldShowChatMemberStats"
			/>
			<div class="-split" />
		</template>
		<div
			class="-body"
			:class="{
				'-body-column': isVertical && c.isStreaming.value,
				'-is-streaming': c.isStreaming.value,
			}"
		>
			<div v-if="shouldShowFiresideStats" class="-leading">
				<AppFiresideStats />
			</div>

			<div
				v-if="c.isStreaming.value && c.chatRoom.value"
				class="-video-wrapper"
				:class="{
					'-vertical': isVertical,
					'-fullscreen': shouldFullscreenStream,
					'-has-cbar': !Screen.isXs,
				}"
			>
				<div class="-video-padding">
					<div
						ref="videoWrapper"
						v-app-observe-dimensions="onDimensionsChange"
						class="-video-container"
					>
						<div
							class="-video-inner"
							:style="{
								width: videoWidth + 'px',
								height: videoHeight + 'px',
							}"
						>
							<AppStickerTarget
								class="-video-inner"
								:controller="c.stickerTargetController"
								:style="{
									top: 0,
									right: 0,
									bottom: 0,
									left: 0,
								}"
							>
								<template v-if="c.rtc.value && c.rtc.value.focusedUser">
									<AppPopper trigger="right-click">
										<AppFiresideStream
											:rtc-user="c.rtc.value.focusedUser"
											:has-header="
												shouldShowHeaderInBody || shouldFullscreenStream
											"
											:has-hosts="shouldFullscreenStream"
										/>

										<template #popover>
											<div class="list-group">
												<a
													class="list-group-item"
													@click="toggleVideoStats()"
												>
													<AppTranslate>Toggle Video Stats</AppTranslate>
												</a>
											</div>
										</template>
									</AppPopper>
								</template>
							</AppStickerTarget>
						</div>
					</div>
				</div>

				<div v-if="c.rtc.value && shouldShowDesktopHosts" class="-hosts-padding">
					<div class="-hosts">
						<AppFiresideHostList />
					</div>

					<AppFiresideShare v-if="!c.isDraft.value" class="-share" hide-heading />
				</div>
			</div>

			<template v-if="c.status.value === 'loading' || c.status.value === 'initial'">
				<div key="loading" class="-message-wrapper">
					<div class="-message">
						<AppIllustration :src="illEndOfFeed">
							<AppLoading
								centered
								:label="$gettext(`Traveling to the fireside...`)"
							/>
						</AppIllustration>
					</div>
				</div>
			</template>
			<template v-else-if="c.status.value === 'unauthorized'">
				<div key="unauthorized" class="-message-wrapper">
					<div class="-message">
						<h2 class="section-header text-center">
							<AppTranslate>Join Game Jolt</AppTranslate>
						</h2>

						<div class="text-center">
							<p class="lead">
								<AppTranslate>Do you love games as much as we do?</AppTranslate>
							</p>
						</div>

						<hr class="underbar underbar-center" />
						<br />

						<AppAuthJoin />
					</div>
				</div>
			</template>
			<template v-else-if="c.status.value === 'expired'">
				<div key="expired" class="-message-wrapper">
					<div class="-message">
						<AppIllustration :src="illNoCommentsSmall">
							<p>
								<AppTranslate>This fireside's fire has burned out.</AppTranslate>
							</p>
							<p>
								<router-link :to="{ name: 'home' }">
									<small><AppTranslate>Everybody go home</AppTranslate></small>
								</router-link>
							</p>
						</AppIllustration>
					</div>
				</div>
			</template>
			<template v-else-if="c.status.value === 'setup-failed'">
				<div key="setup-failed" class="-message-wrapper">
					<div class="-message">
						<AppIllustration :src="illMaintenance">
							<p>
								<AppTranslate>Could not reach this fireside.</AppTranslate>
								<br />
								<AppTranslate>Maybe try finding it again?</AppTranslate>
							</p>
							&nbsp;
							<AppButton block @click="onClickRetry">
								<AppTranslate>Retry</AppTranslate>
							</AppButton>
							&nbsp;
						</AppIllustration>
					</div>
				</div>
			</template>
			<template v-else-if="c.status.value === 'disconnected'">
				<div key="disconnected" class="-message-wrapper">
					<div class="-message">
						<AppIllustration :src="illNoCommentsSmall">
							<p>
								<AppTranslate>
									You have been disconnected from fireside services.
								</AppTranslate>
								<br />
								<br />
								<small>
									<AppTranslate>
										We are actively trying to reconnect you, but you can also
										try refreshing the page.
									</AppTranslate>
								</small>
							</p>
						</AppIllustration>
					</div>
				</div>
			</template>
			<template v-else-if="c.status.value === 'blocked'">
				<div key="blocked" class="-message-wrapper">
					<div class="-message">
						<div class="text-center">
							<AppJolticon icon="friend-remove-2" big notice />
						</div>
						<div class="text-center">
							<h3>
								<AppTranslate>
									You are blocked from joining this fireside
								</AppTranslate>
							</h3>
							<p>
								<router-link :to="{ name: 'home' }">
									<small><AppTranslate>Return home</AppTranslate></small>
								</router-link>
							</p>
						</div>
					</div>
				</div>
			</template>
			<div
				v-else-if="shouldShowChat"
				key="chat"
				class="-chat"
				:class="{ '-trailing': c.isStreaming.value }"
			>
				<AppFadeCollapse
					v-if="shouldShowReactions"
					class="-reactions"
					:collapse-height="100"
				>
					<AppStickerReactions :controller="c.stickerTargetController" />
				</AppFadeCollapse>

				<AppExpand v-if="!shouldShowDesktopHosts" :when="shouldShowMobileHosts">
					<div class="-mobile-hosts">
						<AppFiresideHostList hide-thumb-options />
					</div>
				</AppExpand>

				<div v-if="c.status.value === 'joined'" class="-chat-wrapper">
					<div class="-chat-window">
						<AppChatWindowOutput
							v-if="c.chatRoom.value"
							ref="output"
							class="-chat-window-output fill-backdrop"
							:room="c.chatRoom.value"
							:messages="chatMessages"
							:queued-messages="chatQueuedMessages"
						/>

						<div v-if="!user" class="-login fill-backdrop">
							<div class="alert">
								<p>
									You must be
									<a v-app-auth-required :href="loginUrl">logged in</a>
									to Game Jolt to chat.
								</p>
							</div>
						</div>
						<AppChatWindowSend
							v-else-if="chat && chat.currentUser"
							class="-chat-window-input"
							:room="c.chatRoom.value"
							@focus-change="onChatEditorFocusChange"
						/>
					</div>
				</div>
			</div>

			<div v-if="shouldShowChatMembers" class="-trailing">
				<div class="-chat-members">
					<!-- TODO(big-pp-event) might want to filter out chat-users to exclude unlisted hosts here -->
					<AppFiresideChatMembers
						:chat-users="c.chatUsers.value"
						:chat-room="c.chatRoom.value"
					/>
				</div>
			</div>
		</div>
	</AppFiresideContainer>
</template>

<style lang="stylus" scoped>
.-fireside
	change-bg('bg')
	overflow: hidden
	display: flex
	flex-direction: column
	align-items: center
	position: fixed
	top: var(--shell-top)
	bottom: var(--shell-bottom)
	left: var(--shell-left)
	right: var(--shell-right)
	z-index: $zindex-shell-pane-under

.-header
	flex: none
	width: 100%
	max-width: 1800px
	padding: 0 ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: 0 ($grid-gutter-width / 2)

.-split
	flex: none
	height: $border-width-base
	width: 100%
	background-color: var(--theme-bg-subtle)

.-body
	flex: auto
	display: flex
	flex-direction: row
	width: 100%
	max-width: 1800px
	overflow: hidden

	@media $media-md-up
		padding: 16px 0

	&.-is-streaming
		max-width: none

	&-column
		display: grid
		grid-template-rows: calc(min(33vh, calc((100vw / 1.7777)))) 1fr
		grid-template-columns: 100%
		padding: 0

		.-chat
			max-width: unset !important

		.-chat-window
			border-radius: 0

.-leading
.-chat
.-trailing
	display: flex
	flex-direction: column

.-leading
.-trailing
	flex: 1 0
	max-width: 350px
	overflow: hidden
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

	// on MD size, we push the columns to the right
	@media $media-md
		order: 1

	.-is-streaming &
		min-width: 350px
		max-width: 25%

.-chat
	flex: 3 0
	position: relative
	overflow: visible !important

.-message-wrapper
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	justify-content: center
	align-items: center
	padding-left: ($grid-gutter-width / 2)
	padding-right: ($grid-gutter-width / 2)

.-message
	rounded-corners-lg()
	elevate-2()
	change-bg('bg-offset')
	padding: 16px
	width: 100%
	max-width: 600px

.-fullscreen
	position: fixed
	left: 0
	top: $shell-top-nav-height
	right: 0
	bottom: 0
	z-index: $zindex-shell-hot-bottom + 1
	background-color: $black

	&.-has-cbar
		left: $shell-cbar-width

.-video-wrapper
.-video-container
.-video-inner
	display: flex
	justify-content: center
	align-items: center

.-video-wrapper
	flex: 3 0
	flex-direction: column
	overflow: hidden

	&.-vertical
		flex-direction: row
		flex: none

.-video-padding
	position: relative
	width: 100%
	height: 100%
	padding: 8px

	.-fullscreen &
	.-body-column &
		background-color: $black
		padding: 0

.-video-container
	min-height: 0
	width: 100%
	height: 100%
	position: relative

.-video-inner
	overflow: hidden
	position: absolute !important
	flex-direction: column
	rounded-corners-lg()
	elevate-2()
	background-color: var(--theme-bg-subtle)
	-webkit-transform: translateZ(0)

	.-fullscreen &
	.-body-column &
		border-radius: 0

.-hosts-padding
	flex: none
	width: 100%
	padding-top: 8px
	max-width: 100%
	overflow: hidden
	display: inline-flex
	align-items: flex-start
	grid-gap: 16px

	.-hosts
		min-width: 0
		margin-left: auto
		margin-right: auto

	.-share
		margin-right: 8px
		flex: none

	> *
		margin-top: 0 !important
		margin-bottom: 0 !important

	.-video-wrapper.-vertical &
		padding-top: 0
		padding-right: 8px

.-mobile-hosts
	padding-top: 6px
	padding-bottom: 20px
	display: flex
	justify-content: center

.-chat-wrapper
	position: relative
	height: 100%

.-body-column
	.-reactions
		margin-top: 0
		margin-bottom: 0

.-body-column
.-is-streaming
	.-chat-wrapper
	.-reactions
		margin-left: -($grid-gutter-width-xs / 2)
		margin-right: -($grid-gutter-width-xs / 2)

		@media $media-sm-up
			margin-left: -($grid-gutter-width / 2)
			margin-right: -($grid-gutter-width / 2)

.-chat-window
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	flex-direction: column
	overflow: hidden

	@media $media-md-up
		rounded-corners-lg()

	.-is-streaming &
		border-top-right-radius: 0
		border-bottom-right-radius: 0

	&-output
		flex: auto

.-chat-members
	display: flex
	flex-direction: column
	height: 100%
	overflow: hidden

.-login
	padding: ($grid-gutter-width-xs / 2)

	> *
		margin: 0

	@media $media-sm-up
		padding: ($grid-gutter-width / 2)
</style>
