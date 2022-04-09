<script lang="ts" setup>
import { computed, PropType, ref, watch } from 'vue';
import { AdSlot, AdSlotMeta, AdSlotPlacement, AdSlotSize } from '../ad-slot-info';
import { useAdsController } from '../ad-store';
import AppAdWidgetInner from './AppAdWidgetInner.vue';

const props = defineProps({
	size: {
		type: String as PropType<AdSlotSize>,
		default: 'rectangle',
	},
	placement: {
		type: String as PropType<AdSlotPlacement>,
		default: 'content',
	},
	meta: {
		type: Object as PropType<AdSlotMeta>,
		default: () => ({}),
	},
});

const adsController = useAdsController();
const adSlot = ref(_makeAdSlot());
const shouldShow = computed(() => adsController.shouldShow);

// If anything within our props changes, regenerate.
watch(
	props,
	() => {
		adSlot.value = _makeAdSlot();
	},
	{ deep: true }
);

function _makeAdSlot() {
	return new AdSlot(props.size, props.placement, props.meta);
}
</script>

<template>
	<div
		v-if="shouldShow"
		class="-ad-widget"
		:class="{
			'-size-leaderboard': adSlot.size === 'leaderboard',
			'-size-retangle': adSlot.size === 'rectangle',
		}"
	>
		<div class="-content">
			<AppAdWidgetInner class="-inner" :ad-slot="adSlot" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-ad-widget
	text-align: center

.-content
	display: flex
	align-items: center
	justify-content: center
	margin: 0 auto

	// Make sure the ad is able to take up the full width.
	> .-inner
		flex: auto

// We reserve some extra space for the "report ad" link below the ad itself.
.-size-leaderboard
	.-content
		min-height: 115px

.-size-rectangle
	.-content
		min-height: 275px
</style>