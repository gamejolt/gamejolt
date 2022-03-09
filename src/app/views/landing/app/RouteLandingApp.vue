<script lang="ts">
import { computed } from 'vue';
import { trackAppPromotionClick } from '../../../../_common/analytics/analytics.service';
import { Meta } from '../../../../_common/meta/meta-service';
import AppMobileAppButtons from '../../../../_common/mobile-app/AppMobileAppButtons.vue';
import { getAppUrl, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import phonesImage from './phones.png';
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

const routeTitle = computed(() => `Get the Game Jolt mobile app`);

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

const playStoreUrl = computed(() => getAppUrl(appPromotion));
</script>

<template>
	<div class="route-landing-app">
		<section class="-header theme-dark">
			<div class="-header-darken" />

			<div class="container -header-content">
				<p class="lead">
					Browse art, videos and hilarious gaming moments with millions of gamers, on your
					phone!
				</p>

				<AppMobileAppButtons source="landing" />
			</div>
		</section>

		<a
			:href="playStoreUrl"
			target="_blank"
			@click="trackAppPromotionClick({ source: 'landing', platform: 'mobile' })"
		>
			<div class="-alert-banner sans-margin">
				<div class="container text-center">
					The Game Jolt mobile app is live!
					<strong>Get it now!</strong>
				</div>
			</div>
		</a>

		<section class="section">
			<div class="container text-center">
				<div>
					<a
						:href="playStoreUrl"
						target="_blank"
						@click="trackAppPromotionClick({ source: 'landing', platform: 'mobile' })"
					>
						<img class="-phones" :src="phonesImage" width="385" height="300" alt="" />
					</a>
				</div>

				<AppSpacer vertical :scale="8" />

				<p>
					Need help? Email us at
					<a href="mailto:contact@gamejolt.com">contact@gamejolt.com</a> for support!
				</p>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.route-landing-app
	.-header
		position: relative
		background-color: #7142a0
		background-image: url('./header.jpg')
		background-repeat: no-repeat
		background-position: 50% 50%
		background-size: cover
		height: 450px
		color: var(--theme-fg)

		&-darken
			position: absolute
			top: 0
			right: 0
			bottom: 0
			left: 0
			background-color: rgba($black, 0.15)
			z-index: 0

		&-content
			position: relative
			display: flex
			flex-direction: column
			align-items: center
			justify-content: center
			width: 100%
			height: 450px
			z-index: 1

		.lead
			max-width: 800px
			text-align: center
			font-weight: 800
			font-size: 22px
			text-shadow: 1px 1px 1px rgba($black, 0.5)
			margin-bottom: 20px

			@media $media-sm-up
				font-size: 30px
				margin-bottom: 40px

	.-phones
		max-width: 100%
		height: auto

	.-alert-banner
		padding-top: 24px
		padding-bottom: 24px
		font-size: $font-size-base
		background-color: var(--theme-highlight)
		color: var(--theme-highlight-fg)

		strong
			color: var(--theme-backlight)
			text-decoration: underline
</style>
