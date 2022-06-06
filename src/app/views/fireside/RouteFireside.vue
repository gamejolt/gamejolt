<script lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import AppAuthJoin from '../../../_common/auth/join/join.vue';
import AppBackground from '../../../_common/background/AppBackground.vue';
import { Background } from '../../../_common/background/background.model';
import AppButton from '../../../_common/button/AppButton.vue';
import { Environment } from '../../../_common/environment/environment.service';
import AppExpand from '../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../_common/filters/number';
import { Fireside } from '../../../_common/fireside/fireside.model';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../_common/loading/loading.vue';
import { Meta } from '../../../_common/meta/meta-service';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import { Popper } from '../../../_common/popper/popper.service';
import AppPopper from '../../../_common/popper/popper.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppStickerTarget from '../../../_common/sticker/target/target.vue';
import { useThemeStore } from '../../../_common/theme/theme.store';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { useChatStore } from '../../components/chat/chat-store';
import AppChatWindow from '../../components/chat/window/AppChatWindow.vue';
import { AppFiresideContainer } from '../../components/fireside/container/container';
import {
	createFiresideController,
	FiresideController,
	toggleStreamVideoStats,
} from '../../components/fireside/controller/controller';
import { illEndOfFeed, illMaintenance, illNoCommentsSmall } from '../../img/ill/illustrations';
import AppFiresideBanner from './_banner/banner.vue';
import AppFiresideChatMembers from './_chat-members/AppFiresideChatMembers.vue';
import AppFiresideHeader from './_header/AppFiresideHeader.vue';
import AppFiresideHostList from './_host-list/host-list.vue';
import AppFiresideShare from './_share/share.vue';
import AppFiresideStats from './_stats/stats.vue';
import AppFiresideStream from './_stream/stream.vue';

const FiresideThemeKey = 'fireside';

export default {
	...defineAppRouteOptions({
		deps: { params: ['hash'] },
		lazy: true,
		resolver: async ({ route }) =>
			Api.sendRequest(`/web/fireside/fetch/${route.params.hash}?meta=1`),
	}),
};
</script>

<script lang="ts" setup>
const chatStore = useChatStore()!;
const themeStore = useThemeStore();

const route = useRoute();
const router = useRouter();

const c = shallowRef<FiresideController | null>(null);

let beforeEachDeregister: (() => void) | null = null;

const videoWrapper = ref<HTMLDivElement>();

const canShowMobileHosts = ref(true);
const videoWidth = ref(0);
const videoHeight = ref(0);
const isVertical = ref(false);

// TODO(fireside-redesign) use when we have no authed user
const loginUrl = computed(() => {
	return Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(route.fullPath);
});

const chat = computed(() => {
	return chatStore.chat;
});

const fireside = computed(() => {
	return c.value?.fireside;
});

const routeTitle = computed(() => {
	if (!fireside.value) {
		return $gettext(`Loading Fireside...`);
	}

	return fireside.value.title + ' - Fireside';
});

const shouldFullscreenStream = computed(() => {
	if (!c.value?.isStreaming.value) {
		return false;
	}
	return Screen.isXs && !shouldShowChat.value && !isVertical.value;
});

const shouldShowHeaderInBody = computed(() => {
	return isVertical.value && !!c.value?.isStreaming.value;
});

const shouldShowChat = computed(() => {
	const mobileCondition = Screen.isMobile && c.value?.isStreaming.value ? isVertical.value : true;

	return Boolean(chat.value?.connected && c.value?.chatRoom.value && mobileCondition);
});

const shouldShowChatMembers = computed(() => {
	return !c.value?.isStreaming.value && shouldShowChat.value && Screen.isLg;
});

const shouldShowChatMemberStats = computed(() => {
	return shouldShowDesktopHosts.value && !!c.value?.isStreaming.value;
});

const shouldShowDesktopHosts = computed(() => {
	return !isVertical.value && !Screen.isMobile;
});

const shouldShowMobileHosts = computed(() => {
	return canShowMobileHosts.value && !!c.value?.isStreaming.value;
});

const shouldShowFiresideStats = computed(() => {
	return !c.value?.isStreaming.value && c.value?.status.value === 'joined' && !Screen.isMobile;
});

const shouldShowTitleControls = computed(() => {
	return c.value?.status.value === 'joined';
});

// TODO(chat-backgrounds) remove debug code
const background = computed(
	() =>
		new Background({
			id: 20,
			scaling: 'tile',
			media_item: {
				id: 12613538,
				type: 'background',
				parent_id: 20,
				hash: 'fpxmwtga',
				filename: 'tangerine-drop-fpxmwtga.png',
				filetype: 'image/png',
				is_animated: false,
				width: 800,
				height: 800,
				filesize: 180391,
				crop_start_x: null,
				crop_start_y: null,
				crop_end_x: null,
				crop_end_y: null,
				avg_img_color: 'ffa438',
				img_has_transparency: false,
				added_on: 1648832412000,
				status: 'active',
				img_url:
					'https://i.gjcdn.net/data/backgrounds/20/media/tangerine-drop-fpxmwtga.png',
				mediaserver_url: 'https://m.gjcdn.net/background/800/20-fpxmwtga-v4.webp',
				mediaserver_url_webm: null,
				mediaserver_url_mp4: null,
				video_card_url_mp4: null,
			},
		})
);

const overlayText = computed(() => !!background.value);

createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb || {};
		Meta.fb.title = routeTitle;
		Meta.twitter = payload.twitter || {};
		Meta.twitter.title = routeTitle;

		const fireside = new Fireside(payload.fireside);
		c.value ??= createFiresideController(fireside);

		setPageTheme();
	},
	onDestroyed() {
		c.value?.cleanup();
		themeStore.clearPageTheme(FiresideThemeKey);

		beforeEachDeregister?.();
		beforeEachDeregister = null;
	},
});

function calcIsVertical() {
	if (Screen.isMobile && !import.meta.env.SSR) {
		isVertical.value = window.screen.height > window.screen.width;
	} else {
		isVertical.value = Screen.height > Screen.width;
	}
}

function onDimensionsChange() {
	calcIsVertical();

	if (!videoWrapper.value) {
		return;
	}

	const wrapperWidth = videoWrapper.value.offsetWidth;
	const wrapperHeight = videoWrapper.value.offsetHeight;
	const wrapperRatio = wrapperWidth / wrapperHeight;

	const videoStats = c.value?.rtc.value?.videoChannel.agoraClient.getRemoteVideoStats();
	const receiveWidth = videoStats?.receiveResolutionWidth?.receiveResolutionWidth ?? 16;
	const receiveHeight = videoStats?.receiveResolutionHeight?.receiveResolutionHeight ?? 9;
	const receiveRatio = receiveWidth / receiveHeight;

	// If the video is wider than the containing element...
	if (receiveRatio > wrapperRatio) {
		videoWidth.value = wrapperWidth;
		videoHeight.value = wrapperWidth / receiveRatio;
	} else if (receiveRatio < wrapperRatio) {
		videoHeight.value = wrapperHeight;
		videoWidth.value = wrapperHeight * receiveRatio;
	} else {
		videoWidth.value = wrapperWidth;
		videoHeight.value = wrapperHeight;
	}
}

function setPageTheme() {
	const theme = fireside.value?.user?.theme ?? null;
	themeStore.setPageTheme({ key: FiresideThemeKey, theme });
}

function toggleVideoStats() {
	if (c.value) {
		toggleStreamVideoStats(c.value);
		Popper.hideAll();
	}
}

function onClickRetry() {
	if (c.value?.onRetry.value) {
		c.value.onRetry.value();
	}
}

// TODO(fireside-redesign) add emit to [AppChatWindow] for focus changes
function onChatEditorFocusChange(isFocused: boolean) {
	canShowMobileHosts.value = !isFocused;
}

watch(() => c.value?.isPersonallyStreaming.value, onIsPersonallyStreamingChanged);

watch(
	() => c.value?.rtc.value?.focusedUser?.userModel?.id,
	() => {
		const { stickers, newStickers } = c.value?.stickerTargetController ?? {};
		// Clear any current live stickers when changing the focused user.
		stickers?.value.splice(0, stickers.value.length);
		newStickers?.value.splice(0, newStickers.value.length);
	}
);

function onIsPersonallyStreamingChanged() {
	if (import.meta.env.SSR) {
		return;
	}

	if (!c.value || c.value.isPersonallyStreaming.value) {
		beforeEachDeregister ??= router.beforeEach((_to, _from, next) => {
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
		beforeEachDeregister?.();
		beforeEachDeregister = null;
	}
}
</script>

<template>
	<AppBackground class="route-fireside" :background="background" darken>
		<AppFiresideContainer v-if="c" class="-fireside" :controller="c" allow-route-changes>
			<AppFiresideBanner />

			<template v-if="!shouldShowHeaderInBody">
				<AppFiresideHeader
					class="-fireside-header"
					:class="{ '-overlay': overlayText }"
					:show-controls="shouldShowTitleControls"
					:has-chat="!shouldShowChatMembers"
					:has-chat-stats="false && shouldShowChatMemberStats"
				/>
				<div v-if="!c.isStreaming.value" class="-split" />
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
														<AppTranslate>
															Toggle Video Stats
														</AppTranslate>
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
									<AppTranslate>
										This fireside's fire has burned out.
									</AppTranslate>
								</p>
								<p>
									<router-link :to="{ name: 'home' }">
										<small>
											<AppTranslate>Everybody go home</AppTranslate>
										</small>
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
											We are actively trying to reconnect you, but you can
											also try refreshing the page.
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
					<AppExpand v-if="!shouldShowDesktopHosts" :when="shouldShowMobileHosts">
						<div class="-mobile-hosts">
							<AppFiresideHostList hide-thumb-options />
						</div>
					</AppExpand>

					<div v-if="c.status.value === 'joined'" class="-chat-wrapper">
						<div class="-chat-window">
							<!-- TODO(fireside-redesign) Add this replacement for the input when there's no authed user. -->
							<!-- <div v-if="!user" class="-login fill-backdrop">
								<div class="alert">
									<p>
										You must be
										<a v-app-auth-required :href="loginUrl">logged in</a>
										to Game Jolt to chat.
									</p>
								</div>
							</div> -->
							<AppChatWindow
								v-if="c.chatRoom.value"
								:room="c.chatRoom.value"
								hide-add-members
								hide-close
								full-sidebar
								:overlay="!!background"
							>
								<template #title>
									<div class="-members">
										<span class="-members-count">
											{{ formatNumber(c.chatUsers.value?.count ?? 0) }}
										</span>
										<span class="-members-text">
											<AppTranslate> Members </AppTranslate>
										</span>
									</div>
								</template>
							</AppChatWindow>
						</div>
					</div>
				</div>

				<div
					v-if="shouldShowChatMembers && c.chatUsers.value && c.chatRoom.value"
					class="-trailing"
				>
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
	</AppBackground>
</template>

<style lang="stylus" scoped>
.route-fireside
	change-bg('bg-offset')
	position: fixed
	top: var(--shell-top)
	bottom: var(--shell-bottom)
	left: var(--shell-left)
	right: var(--shell-right)
	z-index: $zindex-shell-pane-under

.-fireside
	width: 100%
	height: 100%
	overflow: hidden
	display: flex
	flex-direction: column
	align-items: center

.-fireside-header
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

	&.-is-streaming
		max-width: none

.-body-column
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

	// on MD size, we push the columns to the right
	@media $media-md
		order: 1

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

	&:not(.-chat)
		@media $media-md-up
			padding-top: 16px
			padding-bottom: 16px

	.-is-streaming &
		min-width: 350px
		max-width: 25%

.-chat
	flex: 3 0
	position: relative
	overflow: visible !important

	::v-deep(.chat-window-send)
		change-bg(bg)

.-members
	font-family: $font-family-heading
	display: inline-flex
	flex-wrap: nowrap
	align-items: center
	gap: 6px

	&
	> *
		text-overflow()

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
	elevate-1()
	position: relative
	height: 100%

.-body-column
.-is-streaming
	.-chat-wrapper
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

.-chat-header
	change-bg('bg-backdrop')

.-chat-window-output
	flex: auto

.-chat-window-input
	background-color: unquote('rgba(var(--theme-bg-subtle-rgb), 0.45)')

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
