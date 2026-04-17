<script lang="ts" setup>
import { computed } from 'vue';

import { trackAppPromotionClick } from '~common/analytics/analytics.service';
import appStoreImage from '~common/mobile-app/button-app-store.svg';
import playStoreImage from '~common/mobile-app/button-play-store.png';
import { AppPromotionSource, getAppUrl, useAppPromotionStore } from '~common/mobile-app/store';
import { styleWhen } from '~styles/mixins';

type Props = {
	source: AppPromotionSource;
	justified?: boolean;
	wrap?: boolean;
};
const { source, justified, wrap } = defineProps<Props>();

const appPromotion = useAppPromotionStore();
const playStoreUrl = computed(() => getAppUrl(appPromotion, { targetStore: 'play' }));
const appStoreUrl = computed(() => getAppUrl(appPromotion, { targetStore: 'app' }));
</script>

<template>
	<div
		class="app-buttons"
		:class="{ '-justified': justified }"
		:style="{
			...styleWhen(wrap, {
				flexWrap: `wrap`,
			}),
		}"
	>
		<a
			class="-button"
			:href="playStoreUrl"
			target="_blank"
			@click="trackAppPromotionClick({ source, platform: 'mobile' })"
		>
			<img
				:src="playStoreImage"
				:width="564 * (50 / 168)"
				:height="50"
				alt="Get it on Google Play"
			/>
		</a>
		<a
			class="-button"
			:href="appStoreUrl"
			target="_blank"
			@click="trackAppPromotionClick({ source, platform: 'mobile' })"
		>
			<img
				:src="appStoreImage"
				:width="120 * (50 / 40)"
				:height="50"
				alt="Download on the App Store"
			/>
		</a>
	</div>
</template>

<style lang="stylus" scoped>
.app-buttons
	display: flex
	flex-direction: row
	align-items: center
	justify-content: center
	grid-gap: 15px

	&.-justified
		justify-content: space-between

	.-button
		display: block
		flex: none
</style>
