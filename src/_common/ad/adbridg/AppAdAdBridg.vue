<script lang="ts" setup>
import { computed } from 'vue';

import { useAdColumn } from '~common/ad/ad-column';
import { AdSlot } from '~common/ad/ad-slot-info';
import { AdBridgAdapter } from '~common/ad/adbridg/adbridg-adapter';
import { getScreen } from '~common/screen/screen-service';

type Props = {
	adSlot: AdSlot;
	adapter: AdBridgAdapter;
};

const { adSlot, adapter } = defineProps<Props>();

const { isMobile } = getScreen();
const column = useAdColumn();

// AdBridg finds these targets on the page itself after each page view, so we
// only have to render them. If the target changes mid-page (the screen crossed
// a breakpoint), AdBridg won't fill it until the next page view.
const target = computed(() =>
	adapter.getSlotTarget(adSlot.unitName, isMobile.value, column?.value ?? null)
);
</script>

<template>
	<div
		v-if="target"
		:id="target.id"
		:key="target.id"
		:data-adbridg-ad-class="target.adClass"
		:style="{
			width: `100%`,
			maxWidth: target.maxWidth ? `${target.maxWidth}px` : undefined,
			maxHeight: target.maxHeight ? `${target.maxHeight}px` : undefined,
			// AdBridg adds a 14px label above the unit, which overflows the max
			// height. Reserve room for it so it doesn't spill out of whatever
			// the ad sits in.
			marginBottom: `14px`,
		}"
	/>
</template>
