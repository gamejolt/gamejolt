<script lang="ts">
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import {
	AppPromotionSource,
	AppPromotionStore,
	AppPromotionStoreKey,
} from '../../utils/mobile-app';
import { trackAppPromotionClick } from '../analytics/analytics.service';
import appStoreImage from './button-app-store.svg';
import playStoreImage from './button-play-store.png';

@Options({})
export default class AppAppButtons extends Vue {
	@Prop({ type: String, required: true })
	source!: AppPromotionSource;

	@Prop({ type: Boolean })
	justified!: boolean;

	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

	readonly trackAppPromotionClick = trackAppPromotionClick;
	readonly playStoreImage = playStoreImage;
	readonly appStoreImage = appStoreImage;
}
</script>

<template>
	<div class="app-buttons" :class="{ '-justified': justified }">
		<a
			class="-button"
			:href="appPromotion.playStoreUrl"
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
			:href="appPromotion.appStoreUrl"
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
