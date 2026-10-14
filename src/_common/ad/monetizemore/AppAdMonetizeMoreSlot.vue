<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { AdSlot } from '~common/ad/ad-slot-info';
import AppAdMonetizeMore from '~common/ad/monetizemore/AppAdMonetizeMore.vue';
import {
	MonetizeMoreAdapter,
	MonetizeMoreSlot,
} from '~common/ad/monetizemore/monetizemore-adapter';

type Props = {
	adSlot: AdSlot;
	adapter: MonetizeMoreAdapter;
};

const { adSlot, adapter } = defineProps<Props>();

/**
 * We change this as the route changes. This way we can tell MonetizeMore when
 * the slot needs to load a new ad in.
 */
const slotId = ref('');

/**
 * The adapter will call into this to display the ad when needed (when the
 * route changes, etc).
 */
const slot: MonetizeMoreSlot = {
	display() {
		// This will completely regenerate the rendered ad component so that it
		// displays a new ad.
		slotId.value = String(Math.random());
	},
};

onMounted(() => {
	adapter.addSlot(slot);
});

onBeforeUnmount(() => {
	adapter.removeSlot(slot);
});
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
		<AppAdMonetizeMore :ad-slot :adapter />
	</div>
</template>
