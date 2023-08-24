<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { trackBannerClick } from '../../../_common/analytics/analytics.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { StoreBannerModel } from './store-banner-model';

const props = defineProps({
	banner: {
		type: Object as PropType<StoreBannerModel>,
		required: true,
	},
});

// @ts-expect-error unused variable
const backgroundImage = computed(() => `url('${props.banner.banner_media?.mediaserver_url}')`);
</script>

<template>
	<a
		class="-banner"
		:href="banner.url"
		@click="trackBannerClick({ type: 'store', label: banner.event_label })"
	>
		<template v-if="banner.banner_media">
			<div class="-image-spacer" />
			<div class="-image" />
		</template>
		<div class="-text">
			{{ banner.text }}
		</div>
		<div class="-button">
			<AppButton primary solid block-xs>
				{{ banner.button }}
			</AppButton>
		</div>
	</a>
</template>

<style lang="stylus" scoped>
.-banner
	change-bg('bg-backdrop')
	rounded-corners-lg()
	position: relative
	display: flex
	flex-direction: column
	align-items: center
	overflow: hidden

	&:hover
		outline: $border-width-base solid var(--theme-link)

.-image-spacer
	flex: none

.-image
	position: absolute
	background-size: cover
	background-position: center
	z-index: 2

.-text
	flex: auto
	font-weight: 700
	color: var(--theme-fg)

@media $media-xs
	.-banner
		padding: 16px
		padding-top: 0

	.-image
		top: 0
		right: 0
		left: 0
		background-image: linear-gradient(0deg, var(--theme-bg-backdrop) 0%, var(--theme-bg-backdrop-trans) 100%), v-bind('backgroundImage')

	.-text
		font-size: 15px
		text-align: center

	.-image-spacer
	.-image
		height: 64px

	.-image-spacer
	.-text
		margin-bottom: 16px

	.-button
		width: 100%

@media $media-sm-up
	.-banner
		flex-direction: row
		padding: 24px 16px
		padding-left: 0

	.-image
		top: 0
		bottom: 0
		left: 0
		background-image: linear-gradient(270deg, var(--theme-bg-backdrop) 0%, var(--theme-bg-backdrop-trans) 70.96%), v-bind('backgroundImage')

	.-text
		width: 100%
		font-size: 17px

	.-image-spacer
	.-image
		width: 230px

	.-image-spacer
	.-text
		margin-right: 16px

@media $media-md-up
	.-banner
		padding: 36px 40px
		padding-left: 0

	.-image-spacer
	.-image
		width: 400px

	.-image-spacer
	.-text
		margin-right: 32px
</style>
