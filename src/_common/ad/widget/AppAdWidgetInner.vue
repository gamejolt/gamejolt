<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, toRef } from 'vue';
import { AdSlot } from '../ad-slot-info';
import { AdInterface, addAd, removeAd, useAdStore } from '../ad-store';

type Props = {
	adSlot: AdSlot;
};

const { adSlot } = defineProps<Props>();

const adStore = useAdStore();
const { monetizeMoreAdapter: adapter } = adStore;

/**
 * We change this as the route changes. This way we can tell any of the ad
 * adapters when the slot needs to load a new ad in.
 */
const slotId = ref('');

const adComponent = toRef(() => adapter.component(adSlot));

/**
 * The [AdsController] will call into this to display the ad when needed (when
 * the route changes, etc).
 */
const ad: AdInterface = {
	display() {
		// This will completely regenerate the rendered ad component so that it
		// displays a new ad.
		slotId.value = _generateSlotId();
	},
};

onMounted(() => {
	addAd(adStore, ad);
});

onBeforeUnmount(() => {
	removeAd(adStore, ad);
});

function _generateSlotId() {
	return String(Math.random());
}
</script>

<template>
	<div
		v-if="slotId"
		:key="slotId"
		:style="{
			// Make sure the ad is able to take up the full width.
			flex: `auto`,
		}"
	>
		<!-- We completely regenerate it when the slot ID changes -->
		<!-- Load the ad component for the currently running ad adapter -->
		<component :is="adComponent" :ad-slot="adSlot" :adapter="adapter" />
	</div>
</template>
