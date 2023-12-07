<script lang="ts" setup>
import { kLayerAds } from '../../_styles/variables';
import { Screen } from '../screen/screen-service';
import AppScrollAffix from '../scroll/AppScrollAffix.vue';
import { isAdEnthused, useAdStore } from './ad-store';
import AppAdWidget from './widget/AppAdWidget.vue';

defineProps({
	showLeft: {
		type: Boolean,
	},
	showRight: {
		type: Boolean,
	},
	/**
	 * The minimum width in pixels that the screen must be for the ads to show.
	 */
	minWidth: {
		type: Number,
		default: 2000,
	},
});

const { shouldShow } = useAdStore();
</script>

<template>
	<div :style="{ position: `relative` }">
		<div
			v-if="showLeft && shouldShow && isAdEnthused && Screen.width >= minWidth"
			:style="{
				position: `absolute`,
				left: `20px`,
				top: 0,
				width: `160px`,
				zIndex: kLayerAds,
			}"
		>
			<!-- We set the padding to 80 just in case there's a top nav affixed -->
			<AppScrollAffix :padding="80">
				<AppAdWidget size="skyscraper-1" placement="side" />
			</AppScrollAffix>
		</div>

		<div
			v-if="showRight && shouldShow && isAdEnthused && Screen.width >= minWidth"
			:style="{
				position: `absolute`,
				right: `20px`,
				top: 0,
				width: `160px`,
				zIndex: kLayerAds,
			}"
		>
			<!-- We set the padding to 80 just in case there's a top nav affixed -->
			<AppScrollAffix :padding="80">
				<AppAdWidget size="skyscraper-2" placement="side" />
			</AppScrollAffix>
		</div>

		<slot />
	</div>
</template>
