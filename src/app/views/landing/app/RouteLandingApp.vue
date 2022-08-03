<script lang="ts">
import { computed } from 'vue';
import { useFullscreenHeight } from '../../../../utils/fullscreen';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import { Background } from '../../../../_common/background/background.model';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppContactLink from '../../../../_common/contact-link/AppContactLink.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import AppMobileAppButtons from '../../../../_common/mobile-app/AppMobileAppButtons.vue';
import { getAppUrl, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
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
	}),
};
</script>

<script lang="ts" setup>
const appPromotion = useAppPromotionStore();
const fullscreenHeight = useFullscreenHeight();

const routeTitle = computed(() => `Get the Game Jolt mobile app`);
const playStoreUrl = computed(() => getAppUrl(appPromotion));

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
});

const headerBackground = new Background({
	id: 21,
	scaling: 'tile',
	media_item: {
		id: 12613508,
		type: 'background',
		parent_id: 13,
		hash: 'zz9n7nfu',
		filename: '',
		filetype: 'image/png',
		is_animated: false,
		width: 800,
		height: 800,
		filesize: 578498,
		crop_start_x: null,
		crop_start_y: null,
		crop_end_x: null,
		crop_end_y: null,
		avg_img_color: '2d4660',
		img_has_transparency: false,
		added_on: 1648832359000,
		status: 'active',
		img_url: 'https://i.gjcdn.net/data/backgrounds/13/media/wacky-tube-man-vhwh8uum.png',
		mediaserver_url: 'https://m.gjcdn.net/background/800/21-zz9n7nfu-v4.webp',
		mediaserver_url_webm: null,
		mediaserver_url_mp4: null,
		video_card_url_mp4: null,
	},
});

const mobileBackground = new Background({
	id: 1,
	scaling: 'tile',
	media_item: {
		id: 12613508,
		type: 'background',
		parent_id: 13,
		hash: 'rjusnzbf',
		filename: '',
		filetype: 'image/png',
		is_animated: false,
		width: 800,
		height: 800,
		filesize: 578498,
		crop_start_x: null,
		crop_start_y: null,
		crop_end_x: null,
		crop_end_y: null,
		avg_img_color: '2d4660',
		img_has_transparency: false,
		added_on: 1648832359000,
		status: 'active',
		img_url: 'https://i.gjcdn.net/data/backgrounds/13/media/wacky-tube-man-vhwh8uum.png',
		mediaserver_url: 'https://m.gjcdn.net/background/800/1-rjusnzbf-v4.webp',
		mediaserver_url_webm: null,
		mediaserver_url_mp4: null,
	},
});

const laptopBackground = new Background({
	id: 17,
	scaling: 'tile',
	media_item: {
		id: 12613508,
		type: 'background',
		parent_id: 17,
		hash: 'rjusnzbf',
		filename: '',
		filetype: 'image/png',
		is_animated: false,
		width: 800,
		height: 800,
		filesize: 578498,
		crop_start_x: null,
		crop_start_y: null,
		crop_end_x: null,
		crop_end_y: null,
		avg_img_color: '2d4660',
		img_has_transparency: false,
		added_on: 1648832359000,
		status: 'active',
		img_url: 'https://i.gjcdn.net/data/backgrounds/13/media/wacky-tube-man-vhwh8uum.png',
		mediaserver_url: 'https://m.gjcdn.net/background/800/15-vgdgtzuc-v4.webp',
		mediaserver_url_webm: null,
		mediaserver_url_mp4: null,
	},
});

const bean1Path = `M474.117 0.00164546C440.378 0.230874 399.077 24.3772 395.372 53.2712C390.515 91.1562 434.151 94.9785 447.427 103.513C460.704 112.048 475.112 125.826 498.74 118.705C534.693 107.868 535.838 26.2776 499.687 5.85515C492.417 1.74837 483.563 -0.0625347 474.117 0.00164546ZM99.2944 72.4801C89.5244 72.5766 78.989 74.286 67.0971 78.1071C-71.1245 122.521 10.467 410.786 254.288 445.08C410.825 467.097 605.275 360.162 590.111 235.181C576.624 124.023 432.622 141.706 327.251 137.279C190.101 131.516 159 71.8906 99.2944 72.4801Z`;
const bean1Width = 591;
const bean1Height = 448;

const bean1ForegroundPath = `M76 2.85513C66.23 2.95162 78.9888 71.286 67.0968 75.1071C-71.1248 119.521 10.4668 407.786 254.288 442.08C410.824 464.097 605.274 357.162 590.111 232.181C576.624 121.023 570 75.1071 542 2.85513C404.849 -2.9075 135.705 2.26554 76 2.85513Z`;
const bean1ForegroundWidth = 591;
const bean1ForegroundHeight = 445;

const bean2Path = `M255.843 0.00888161C102.677 1.44696 -32.7816 182.072 7.03408 273.382C57.3668 388.811 209.717 353.293 276.309 370.657C357.7 391.881 518.401 481.257 580.36 374.546C662.293 233.435 441.393 5.08325 263.149 0.0752754C260.71 0.00679033 258.274 -0.0139089 255.843 0.00888161ZM30.4267 350.48C24.9463 350.506 19.4031 351.707 13.788 354.569C-8.45387 365.906 -5.93206 414.447 37.2392 437.14C80.9842 460.134 136.739 443.367 143.708 416.278C152.12 383.579 113.373 383.67 86.9403 372.751C68.7491 365.237 49.9992 350.381 30.4267 350.48ZM218.011 381.349C208.48 381.337 198.059 383.719 188.954 388.663C164.993 401.674 163.605 429.485 175.938 436.007C199.268 448.343 249.476 424.968 248.048 400.626C247.31 388.05 233.895 381.37 218.011 381.349Z`;
const bean2Width = 598;
const bean2Height = 448;

const bean2ForegroundPath = `M7.03416 0.0752779C7.03407 110 7.03412 180 7.03406 273.382C57.3668 388.811 209.717 353.293 276.309 370.657C357.7 391.881 518.401 481.257 580.36 374.546C593.5 217 593.5 108 593.5 0.0752864C591.061 0.00680137 9.46538 0.0524873 7.03416 0.0752779Z`;
const bean2ForegroundWidth = 598;
const bean2ForegroundHeight = 448;
</script>

<template>
	<div class="route-landing-app">
		<AppBackground :background="headerBackground" scroll>
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
				<!--
				We have to scale the path data to the size of the viewport. We do that
				through the transform.
				http://meyerweb.com/eric/thoughts/2017/02/24/scaling-svg-clipping-paths-for-css-use/
				-->
				<svg height="0" width="0" :viewBox="`0 0 ${bean1Width} ${bean1Height}`">
					<defs>
						<clipPath
							id="-bean-1"
							clipPathUnits="objectBoundingBox"
							:transform="`scale(${1 / bean1Width} ${1 / bean1Height})`"
						>
							<path :d="bean1Path" />
						</clipPath>
					</defs>
				</svg>

				<svg
					height="0"
					width="0"
					:viewBox="`0 0 ${bean1ForegroundWidth} ${bean1ForegroundHeight}`"
				>
					<defs>
						<clipPath
							id="-bean-1-fg"
							clipPathUnits="objectBoundingBox"
							:transform="`scale(${1 / bean1ForegroundWidth} ${
								1 / bean1ForegroundHeight
							})`"
						>
							<path :d="bean1ForegroundPath" />
						</clipPath>
					</defs>
				</svg>

				<svg height="0" width="0" :viewBox="`0 0 ${bean2Width} ${bean2Height}`">
					<defs>
						<clipPath
							id="-bean-2"
							clipPathUnits="objectBoundingBox"
							:transform="`scale(${1 / bean2Width} ${1 / bean2Height})`"
						>
							<path :d="bean2Path" />
						</clipPath>
					</defs>
				</svg>

				<svg
					height="0"
					width="0"
					:viewBox="`0 0 ${bean2ForegroundWidth} ${bean2ForegroundHeight}`"
				>
					<defs>
						<clipPath
							id="-bean-2-fg"
							clipPathUnits="objectBoundingBox"
							:transform="`scale(${1 / bean2ForegroundWidth} ${
								1 / bean2ForegroundHeight
							})`"
						>
							<path :d="bean2ForegroundPath" />
						</clipPath>
					</defs>
				</svg>

				<div class="-content-row">
					<div class="-content-col-img">
						<div
							:style="{
								'clip-path': `url(#-bean-2)`,
								overflow: 'hidden',
							}"
						>
							<AppBackground :background="laptopBackground" scroll>
								<AppAspectRatio :ratio="bean2Width / bean2Height" />
							</AppBackground>
						</div>
						<div
							class="-bean-img-wrapper"
							:style="{
								'clip-path': `url(#-bean-2-fg)`,
								overflow: 'hidden',
							}"
						>
							<img class="-laptop-img" :src="laptopImage" alt="" />
						</div>
					</div>
					<div class="-content-col-buttons">
						<div class="-content-heading">at home</div>

						<AppSpacer vertical :scale="6" />

						<AppButton primary block @click="download('windows', '64')">
							<AppJolticon icon="windows" middle />
							Download for Windows
						</AppButton>

						<AppSpacer vertical :scale="4" />

						<AppButton primary block @click="download('linux', '64')">
							<AppJolticon icon="linux" middle />
							Download for Linux
						</AppButton>
					</div>
				</div>

				<div class="-content-row">
					<div class="-content-col-img">
						<div
							:style="{
								'clip-path': `url(#-bean-1)`,
								overflow: 'hidden',
							}"
						>
							<AppBackground :background="mobileBackground" scroll>
								<AppAspectRatio :ratio="bean1Width / bean1Height" />
							</AppBackground>
						</div>
						<div
							class="-bean-img-wrapper"
							:style="{
								'clip-path': `url(#-bean-1-fg)`,
								overflow: 'hidden',
							}"
						>
							<img class="-mobile-img" :src="mobileImage" alt="" />
						</div>
					</div>
					<div class="-content-col-buttons">
						<div class="-content-heading">on the go</div>

						<AppSpacer vertical :scale="6" />

						<AppButton primary block @click="download('windows', '64')">
							<AppJolticon icon="mac" middle />
							Download for iPhone / iPad
						</AppButton>

						<AppSpacer vertical :scale="4" />

						<AppButton primary block @click="download('linux', '64')">
							<!-- <AppJolticon icon="" middle /> -->
							Download for Android
						</AppButton>
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
	font-family: $font-family-heading
	font-weight: 800
	font-size: 64px
	line-height: 1
	text-shadow: 1px 1px 1px rgba($black, 0.5)
	margin-bottom: 20px

	@media $media-sm-up
		flex: 6

	@media $media-md-up
		font-size: 80px

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

.-content-row
	display: flex
	flex-direction: column
	grid-gap: 24px
	align-items: center
	padding: 64px 0

	@media $media-sm-up
		flex-direction: row
		grid-gap: 100px

.-content-col-img
	width: 100%
	position: relative

	@media $media-sm-up
		flex: 6

.-content-col-buttons
	display: flex
	flex-direction: column
	align-items: center

	@media $media-sm-up
		flex: 4

.-content-heading
.-footer-heading
	font-family: $font-family-heading
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

.-bean-img-wrapper
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 1

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

@keyframes anim-up-down
	0%
		transform: translateY(0)

	50%
		transform: translateY(-30px)
</style>
