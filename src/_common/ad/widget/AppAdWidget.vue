<script lang="ts" setup>
import { computed, PropType, ref, toRefs, watch } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
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

const { size, placement, meta } = toRefs(props);

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
	return new AdSlot(size.value, placement.value, meta.value);
}
</script>

<template>
	<div v-if="shouldShow" :style="{ textAlign: `center` }">
		<div
			:style="[
				{
					display: `flex`,
					alignItems: `center`,
					justifyContent: `center`,
					margin: `0 auto`,
				},
				styleWhen(adSlot.size === 'leaderboard', {
					minHeight: `115px`,
				}),
				styleWhen(adSlot.size === 'rectangle', {
					minHeight: `250px`,
				}),
				styleWhen(adSlot.size === 'video', {
					minHeight: `250px`,
				}),
			]"
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
