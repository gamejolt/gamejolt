<script lang="ts">
import AppMobileAppButtons from '../../../../_common/mobile-app/AppMobileAppButtons.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import phonesImage from './phones.png';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {},
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: `Get the Game Jolt mobile app`,
	disableTitleSuffix: true,
});
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

		<section class="section">
			<div class="container text-center">
				<div>
					<img class="-phones" :src="phonesImage" width="385" height="300" alt="" />
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
</style>
