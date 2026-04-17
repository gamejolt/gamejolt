<script lang="ts" setup>
import { useAdStore } from '~common/ad/ad-store';
import AppAdWidget from '~common/ad/widget/AppAdWidget.vue';
import { Screen } from '~common/screen/screen-service';
import AppScrollAffix from '~common/scroll/AppScrollAffix.vue';
import { kLayerAds } from '~styles/variables';

type Props = {
	showLeft?: boolean;
	showRight?: boolean;
	/**
	 * The minimum width in pixels that the screen must be for the ads to show.
	 */
	minWidth?: number;
};

const { showLeft, showRight, minWidth = 2000 } = defineProps<Props>();

const { shouldShow } = useAdStore();
</script>

<template>
	<div class="relative">
		<div
			v-if="showLeft && shouldShow && Screen.width >= minWidth"
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
				<AppAdWidget unit-name="rail" />
			</AppScrollAffix>
		</div>

		<div
			v-if="showRight && shouldShow && Screen.width >= minWidth"
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
				<AppAdWidget unit-name="rail" />
			</AppScrollAffix>
		</div>

		<slot />
	</div>
</template>
