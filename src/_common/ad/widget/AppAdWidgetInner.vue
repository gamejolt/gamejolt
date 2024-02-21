<script lang="ts" setup>
import { onBeforeUnmount, onMounted, PropType, ref, toRef, toRefs } from 'vue';
import { AdSlot } from '../ad-slot-info';
import { addAd, AdInterface, chooseAdAdapterForSlot, removeAd, useAdStore } from '../ad-store';

function _generateSlotId() {
	return Math.random() + '';
}

const props = defineProps({
	adSlot: {
		type: Object as PropType<AdSlot>,
		required: true,
	},
});

const { adSlot } = toRefs(props);
const adStore = useAdStore();

/**
 * We change this as the route changes. This way we can tell any of the ad
 * adapters when the slot needs to load a new ad in.
 */
const slotId = ref('');

const adapter = toRef(() => chooseAdAdapterForSlot(adStore, adSlot.value));
const adComponent = toRef(() => adapter.value.component(adSlot.value));

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
</script>

<template>
	<div v-if="slotId" :key="slotId" class="ad-widget-inner">
		<!-- We completely regenerate it when the slot ID changes -->
		<!-- Load the ad component for the currently running ad adapter -->
		<component :is="adComponent" :ad-slot="adSlot" :adapter="adapter" />
	</div>
</template>
