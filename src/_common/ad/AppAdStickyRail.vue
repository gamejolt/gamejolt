<script lang="ts" setup>
import { useAdStore } from '~common/ad/ad-store';
import AppAdAdBridgStickyTarget from '~common/ad/adbridg/AppAdAdBridgStickyTarget.vue';
import AppAdWidget from '~common/ad/widget/AppAdWidget.vue';
import { getScreen } from '~common/screen/screen-service';
import AppScrollAffix from '~common/scroll/AppScrollAffix.vue';
import { kLayerAds } from '~styles/variables';

type Props = {
	showLeft?: boolean;
	showRight?: boolean;
	/**
	 * The minimum width in pixels that the screen must be for the ads to show.
	 */
	minWidth?: number;
	/**
	 * For pages that have a sidebar. AdBridg's sticky has to sit below the
	 * sidebar content, so the page renders it there instead.
	 */
	hideAdBridgSticky?: boolean;
};

const { showLeft, showRight, minWidth = 2000, hideAdBridgSticky } = defineProps<Props>();

const { shouldShow, adapter } = useAdStore();
const { screenWidth, isMobile } = getScreen();

const isAdBridg = adapter.provider === 'adbridg';
</script>

<template>
	<div :style="{ position: `relative` }">
		<template v-if="!isAdBridg">
			<div
				v-if="showLeft && shouldShow && screenWidth >= minWidth"
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
					<AppAdWidget unit-name="gutter" />
				</AppScrollAffix>
			</div>

			<div
				v-if="showRight && shouldShow && screenWidth >= minWidth"
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
					<AppAdWidget unit-name="gutter" />
				</AppScrollAffix>
			</div>
		</template>

		<slot />

		<!-- AdBridg's sticky always sits below the content. -->
		<AppAdAdBridgStickyTarget
			v-if="
				isAdBridg &&
				!hideAdBridgSticky &&
				(showLeft || showRight) &&
				shouldShow &&
				!isMobile
			"
		/>
	</div>
</template>
