<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { AdSlot, AdSlotPlacement, AdSlotSize } from '../ad-slot-info';
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
});

const { size, placement } = toRefs(props);

const controller = useAdsController();
const adSlot = ref(_makeAdSlot());

// If anything within our props changes, regenerate.
watch(
	props,
	() => {
		adSlot.value = _makeAdSlot();
	},
	{ deep: true }
);

function _makeAdSlot() {
	return new AdSlot(size.value, placement.value);
}
</script>

<template>
	<div v-if="controller.shouldShow" :style="{ textAlign: `center` }">
		<div
			:style="{
				display: `flex`,
				alignItems: `center`,
				justifyContent: `center`,
				margin: `0 auto`,
				...styleWhen(adSlot.size === 'leaderboard', {
					minHeight: `115px`,
				}),
				...styleWhen(adSlot.size === 'rectangle', {
					minHeight: `250px`,
				}),
				...styleWhen(adSlot.size === 'video', {
					minHeight: `200px`,
				}),
				// For debugging ad placements.
				...styleWhen(GJ_BUILD_TYPE !== 'build', {
					background: `rgba(255, 0, 0, 0.2)`,
					...styleWhen(adSlot.size === 'skyscraper-1' || adSlot.size === 'skyscraper-2', {
						minWidth: `160px`,
						minHeight: `600px`,
					}),
				}),
			}"
		>
			<AppAdWidgetInner
				:style="{
					// Make sure the ad is able to take up the full width.
					flex: `auto`,
				}"
				:ad-slot="adSlot"
			/>
		</div>
	</div>
</template>
