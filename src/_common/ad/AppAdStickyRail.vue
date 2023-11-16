<script lang="ts" setup>
import { kLayerAds } from '../../_styles/variables';
import { Screen } from '../screen/screen-service';
import AppScrollAffix from '../scroll/AppScrollAffix.vue';
import { isAdEnthused, useAdsController } from './ad-store';
import AppAdWidget from './widget/AppAdWidget.vue';

defineProps({
	affixPadding: {
		type: Number,
		default: 8,
	},
});

const ads = useAdsController();
</script>

<template>
	<div :style="{ position: `relative` }">
		<div
			v-if="ads.shouldShow && isAdEnthused && Screen.width >= 2000"
			:style="{
				position: `absolute`,
				left: `20px`,
				top: 0,
				width: `160px`,
				zIndex: kLayerAds,
			}"
		>
			<AppScrollAffix :padding="affixPadding">
				<AppAdWidget size="skyscraper-1" placement="side" />
			</AppScrollAffix>
		</div>

		<slot />
	</div>
</template>
