<script lang="ts" setup>
import { ref, watch } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { AdSlot, AdSlotPlacement, AdSlotSize } from '../ad-slot-info';
import { useAdStore } from '../ad-store';
import AppAdWidgetInner from './AppAdWidgetInner.vue';

type Props = {
	size?: AdSlotSize;
	placement?: AdSlotPlacement;
};

const { size = 'rectangle', placement = 'content' } = defineProps<Props>();

const { shouldShow } = useAdStore();

const adSlot = ref(_makeAdSlot());

// If anything within our props changes, regenerate.
watch(
	[() => size, () => placement],
	() => {
		adSlot.value = _makeAdSlot();
	},
	{ deep: true }
);

function _makeAdSlot() {
	return new AdSlot(size, placement);
}
</script>

<template>
	<div v-if="shouldShow" :style="{ textAlign: `center` }">
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
					...styleWhen(adSlot.size === 'skyscraper', {
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
