<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
trackAppDownload,
trackAppPromotionClick,
} from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import { BackgroundModel } from '../../../../_common/background/background.model';
import AppBean from '../../../../_common/bean/AppBean.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppContactLink from '../../../../_common/contact-link/AppContactLink.vue';
import { DeviceArch, DeviceOs, getDeviceOS } from '../../../../_common/device/device.service';
import {
chooseBestGameBuild,
pluckInstallableGameBuilds,
} from '../../../../_common/game/game.model';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import { HistoryTick } from '../../../../_common/history-tick/history-tick-service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import AppMobileAppButtons from '../../../../_common/mobile-app/AppMobileAppButtons.vue';
import { getAppUrl, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import { storeModel, storeModelList } from '../../../../_common/model/model-store.service';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { kThemeGjOverlayNotice } from '../../../../_common/theme/variables';
import { styleFlexCenter, styleWhen } from '../../../../_styles/mixins';
import { kFontSizeLarge } from '../../../../_styles/variables';
import { arrayShuffle } from '../../../../utils/array';
import { useFullscreenHeight } from '../../../../utils/fullscreen';
import laptopImage from './laptop.webp';
import mobileImage from './mobile.webp';
import footerImage from './peek-jelly.png';
import qrImage from './qr.png';
import socialImage from './social.jpg';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {},
		resolver: () => Api.sendRequest('/web/landing/app'),
	}),
};
</script>

<script lang="ts" setup>
const appPromotion = useAppPromotionStore();
const fullscreenHeight = useFullscreenHeight();
const route = useRoute();

const packageData = ref<GamePackagePayloadModel>();
const fallbackUrl = ref('https://gamejolt.com');
const headerBackground = ref<BackgroundModel>();
const mobileBackground = ref<BackgroundModel>();
const laptopBackground = ref<BackgroundModel>();

const detectedDevice = getDeviceOS();

const routeTitle = computed(() => `Get the Game Jolt app`);
const playStoreUrl = computed(() => getAppUrl(appPromotion, { targetStore: 'play' }));
const appStoreUrl = computed(() => getAppUrl(appPromotion, { targetStore: 'app' }));

const hasKeyClaimIntent = computed(() => route.query.intent === 'claim-key');

createAppRoute({
	routeTitle: routeTitle.value,
	disableTitleSuffix: true,
	onInit() {
		Meta.description = `Game Jolt is the social app for the next generation of gamers. Browse and share your fan art, gaming videos or find friends to stream with across Game Jolt communities!`;

		Meta.fb = {
			type: 'website',
			title: routeTitle.value,
			description: Meta.description,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: routeTitle.value,
			description: Meta.description,
		};

		Meta.fb.image = Meta.twitter.image = socialImage;
	},
	onResolved({ payload }) {
		packageData.value = new GamePackagePayloadModel(payload.packageData);
		fallbackUrl.value = payload.clientGameUrl;

		headerBackground.value = storeModel(BackgroundModel, payload.headerBackground);

		const backgrounds = arrayShuffle(storeModelList(BackgroundModel, payload.backgrounds));
		laptopBackground.value = backgrounds.pop();
		mobileBackground.value = backgrounds.pop();
	},
});

async function downloadDesktopApp(platform: DeviceOs, arch: DeviceArch) {
	HistoryTick.sendBeacon('client-download');
	trackAppDownload({ platform, arch });

	const downloadUrl = await _getDownloadUrl(platform, arch);
	if (downloadUrl === null) {
		Navigate.gotoExternal(fallbackUrl.value);
		return;
	}

	if (GJ_IS_DESKTOP_APP) {
		Navigate.gotoExternal(downloadUrl);
	} else {
		Navigate.goto(downloadUrl);
	}
}

async function _getDownloadUrl(platform: string, arch: string) {
	if (!packageData.value) {
		return null;
	}

	const installableBuilds = pluckInstallableGameBuilds(
		packageData.value.packages,
		platform,
		arch
	);
	const bestBuild = chooseBestGameBuild(installableBuilds, platform, arch);
	if (!bestBuild) {
		return null;
	}

	try {
		const result = await bestBuild.getDownloadUrl();
		if (!result || !result.url) {
			return null;
		}
		return result.url;
	} catch (err) {
		console.warn(err);
		return null;
	}
}
</script>

<template>
	<div class="route-landing-app">
		<AppBackground :background="headerBackground" scroll-direction="right">
			<div
				v-if="hasKeyClaimIntent"
				:style="{
					backgroundColor: kThemeGjOverlayNotice,
					padding: `24px`,
					textAlign: `center`,
					fontWeight: `bold`,
					color: `white`,
					fontSize: kFontSizeLarge.px,
				}"
			>
				<div :style="[styleFlexCenter(), { marginBottom: `12px` }]">
					<AppJolticon icon="notice" big :style="{ color: `white` }" />
				</div>

				<span>
					{{ $gettext(`Keys can only be claimed using the Game Jolt mobile app.`) }}
					{{ ' ' }}
				</span>

				<a
					href="https://app.gamejolt.com/qr"
					class="link-unstyled"
					:style="{ textDecoration: 'underline' }"
				>
					{{ $gettext(`Get the mobile app now!`) }}
				</a>
			</div>
			<section class="-header theme-dark">
				<div class="-header-darken" />

				<div class="container">
					<div class="-header-content">
						<div class="-header-lead lead">
							for gamers.
							<br />
							for creators.
							<br />
							<span class="-header-em">for you.</span>
						</div>

						<div class="-header-buttons">
							<template v-if="!Screen.isXs">
								<!-- Sized a bit smaller than the original image so it's sharp on hidpi -->
								<img
									:src="qrImage"
									width="175"
									height="175"
									style="display: block"
									alt="QR Code"
								/>

								<AppSpacer vertical :scale="4" />
							</template>

							<AppMobileAppButtons source="landing" />
						</div>
					</div>
				</div>

				<div class="-header-chevron">
					<AppJolticon class="-header-chevron-icon" icon="chevron-down" />
				</div>
			</section>
		</AppBackground>

		<div class="fill-offset">
			<div class="container">
				<div class="-content-rows">
					<div v-if="!GJ_IS_DESKTOP_APP" class="-desktop-row -content-row">
						<AppBean class="-bean" :variant="2" no-clamp>
							<template #background>
								<AppBackground
									:background="laptopBackground"
									scroll-direction="right"
								/>
							</template>

							<img class="-laptop-img" :src="laptopImage" alt="" />
						</AppBean>

						<div class="-content-col-spacer" />

						<div class="-content-col-buttons">
							<div class="-content-heading">
								{{ $gettext(`Desktop app`) }}
							</div>

							<AppSpacer vertical :scale="6" />

							<div class="-buttons">
								<AppButton
									primary
									block
									:solid="detectedDevice === 'windows'"
									@click="downloadDesktopApp('windows', '64')"
								>
									<AppJolticon icon="windows" middle />
									Download for Windows
								</AppButton>

								<AppButton
									primary
									block
									:solid="detectedDevice === 'linux'"
									:style="{
										order: detectedDevice === 'linux' ? -1 : undefined,
									}"
									@click="downloadDesktopApp('linux', '64')"
								>
									<AppJolticon icon="linux" middle />
									Download for Linux
								</AppButton>
							</div>
						</div>
					</div>

					<div
						class="-mobile-row -content-row"
						:style="
							styleWhen(
								detectedDevice === 'ios' ||
									detectedDevice === 'android' ||
									hasKeyClaimIntent,
								{
									order: -1,
								}
							)
						"
					>
						<AppBean class="-bean" no-clamp>
							<template #background>
								<AppBackground
									:background="mobileBackground"
									scroll-direction="right"
								/>
							</template>

							<img class="-mobile-img" :src="mobileImage" alt="" />
						</AppBean>

						<div class="-content-col-spacer" />

						<div class="-content-col-buttons">
							<div class="-content-heading">
								{{ $gettext(`Mobile app`) }}
							</div>

							<AppSpacer vertical :scale="6" />

							<div class="-buttons">
								<AppButton
									primary
									block
									:solid="detectedDevice === 'ios'"
									:to="appStoreUrl"
									@click="
										trackAppPromotionClick({
											source: 'landing',
											platform: 'mobile',
										})
									"
								>
									<AppJolticon icon="mac" middle />
									Download for iPhone / iPad
								</AppButton>

								<AppButton
									primary
									block
									:solid="detectedDevice === 'android'"
									:to="playStoreUrl"
									:style="{
										order: detectedDevice === 'android' ? -1 : undefined,
									}"
									@click="
										trackAppPromotionClick({
											source: 'landing',
											platform: 'mobile',
										})
									"
								>
									<AppJolticon icon="android" middle />
									Download for Android
								</AppButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="-footer">
			<div class="-footer-heading">need help?</div>

			<AppSpacer vertical :scale="4" />

			<p>
				Just email us at
				<AppContactLink email="contact@gamejolt.com">contact@gamejolt.com</AppContactLink>
				for support.
			</p>

			<AppSpacer vertical :scale="10" />

			<img class="-footer-img" :src="footerImage" width="364" height="200" alt="" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-header
	position: relative
	color: var(--theme-fg)
	height: v-bind('fullscreenHeight')

	@media $media-sm-up
		height: 400px

.-header-darken
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	background-color: rgba($black, 0.5)
	z-index: 0

.-header-content
	position: relative
	display: flex
	flex-direction: column
	grid-gap: 32px
	align-items: center
	justify-content: center
	width: 100%
	z-index: 1

	@media $media-xs
		position: absolute
		left: 0
		top: 0
		height: 100%
		width: 100%

	@media $media-sm-up
		flex-direction: row
		grid-gap: 100px
		height: 400px

.-header-lead
	text-align: center
	font-family: $font-family-display
	font-weight: 800
	font-size: 64px
	line-height: 1
	text-shadow: 1px 1px 1px rgba($black, 0.5)
	margin-bottom: 20px

	@media $media-sm-up
		flex: 6

	@media $media-md-up
		font-size: 96px

.-header-em
	color: var(--theme-highlight)

.-header-buttons
	display: flex
	flex-direction: column
	align-items: center

	@media $media-sm-up
		flex: 4

.-header-chevron
	position: absolute
	bottom: 24px
	left: 0
	width: 100%
	text-align: center

	@media $media-sm-up
		display: none

.-header-chevron-icon
	color: var(--theme-highlight)
	font-size: 40px
	animation-name: anim-up-down
	animation-timing-function: $weak-ease-in-out
	animation-duration: 3s
	animation-iteration-count: infinite

.-content-rows
	display: flex
	flex-direction: column

.-content-row
	display: flex
	flex-direction: column
	grid-gap: 24px
	align-items: center
	padding: 64px 0

	@media $media-sm-up
		flex-direction: row
		grid-gap: 24px


.-bean
	@media $media-sm-up
		flex: 6

.-content-col-buttons
	display: flex
	flex-direction: column
	align-items: center
	width: 100%

	@media $media-sm-up
		flex: 5

// Acts as an empty column for better spacing on larger screens
.-content-col-spacer
	@media $media-sm-up
		flex: 1

.-content-heading
.-footer-heading
	font-family: $font-family-display
	font-size: 48px
	font-weight: bold

.-footer
	padding-top: 64px
	text-align: center

	@media $media-sm-up
		padding-top: 88px

.-footer-img
	@media $media-xs
		width: 220px
		height: auto

.-mobile-img
	position: absolute
	width: 60%
	left: 50%
	margin-left: -(@width / 2)
	bottom: -15%

.-laptop-img
	position: absolute
	width: 110%
	left: 50%
	margin-left: -(@width / 2)
	bottom: 10%

.-buttons
	display: flex
	flex-direction: column
	grid-gap: 16px
	width: 100%

	.button
		margin: 0

@keyframes anim-up-down
	0%
		transform: translateY(0)

	50%
		transform: translateY(-30px)
</style>
