<script lang="ts" setup>
import { computed, PropType, ref, watch } from 'vue';
import { AdSlot, AdSlotMeta, AdSlotPlacement, AdSlotSize } from '../ad-slot-info';
import { useAdsController } from '../ad-store';
import AppAdWidgetInner from './inner.vue';

const props = defineProps({
	size: { type: String as PropType<AdSlotSize>, default: 'rectangle' },
	placement: { type: String as PropType<AdSlotPlacement>, default: 'content' },
	meta: { type: Object as PropType<AdSlotMeta>, default: () => ({}) },
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
		:class="[
			$style.adWidget,
			{
				[$style.sizeLeaderboard]: adSlot.size === 'leaderboard',
				[$style.sizeRectangle]: adSlot.size === 'rectangle',
			},
		]"
	>
		<div :class="$style.content">
			<app-ad-widget-inner :class="$style.inner" :ad-slot="adSlot" />
		</div>
	</div>
</template>

<!-- TODO(vue3): I was just testing this out, see if it works and decide what to do -->
<style lang="scss" module>
.adWidget {
	text-align: center;

	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;

		// Make sure the ad is able to take up the full width.
		> .inner {
			flex: auto;
		}
	}

	// We reserve some extra space for the "report ad" link below the ad itself.
	&.sizeLeaderboard {
		.content {
			min-height: 115px;
		}
	}

	&.sizeRectangle {
		.content {
			min-height: 275px;
		}
	}
}
</style>
