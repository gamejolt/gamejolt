<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, PropType, ref } from 'vue';
import { FiresidePost } from '../../fireside/post/post-model';
import { Game } from '../../game/game.model';
import { User } from '../../user/user.model';
import { AdSlot } from '../ad-slot-info';
import {
	addAd,
	AdEventView,
	AdInterface,
	AdTypeDisplay,
	chooseAdAdapterForSlot,
	removeAd,
	sendAdBeacon,
	useAdsController,
} from '../ad-store';

function _generateSlotId() {
	return Math.random() + '';
}

const props = defineProps({
	adSlot: {
		type: Object as PropType<AdSlot>,
		required: true,
	},
});

const adsController = useAdsController();

/**
 * We change this as the route changes. This way we can tell any of the ad
 * adapters when the slot needs to load a new ad in.
 */
const slotId = ref('');

const resourceInfo = computed(() => {
	let resource: string = undefined as any;
	let resourceId: number = undefined as any;

	const adResource = adsController.settings.resource;
	if (adResource instanceof Game) {
		resource = 'Game';
		resourceId = adResource.id;
	} else if (adResource instanceof User) {
		resource = 'User';
		resourceId = adResource.id;
	} else if (adResource instanceof FiresidePost) {
		resource = 'Fireside_Post';
		resourceId = adResource.id;
	}

	return { resource, resourceId };
});

const adapter = computed(() => chooseAdAdapterForSlot(adsController, props.adSlot));
const adComponent = computed(() => adapter.value.component(props.adSlot));

/**
 * The [AdsController] will call into this to display the ad when needed (when
 * the route changes, etc).
 */
const ad: AdInterface = {
	display() {
		// This will completely regenerate the rendered ad component so that it
		// displays a new ad.
		slotId.value = _generateSlotId();

		// Log that we viewed this ad immediately.
		_sendBeacon(AdEventView);
	},
};

onMounted(() => {
	addAd(adsController, ad);
});

onBeforeUnmount(() => {
	removeAd(adsController, ad);
});

function _sendBeacon(event: string) {
	const { resource, resourceId } = resourceInfo.value;
	sendAdBeacon(event, AdTypeDisplay, resource, resourceId);
}
</script>

<template>
	<div v-if="slotId" :key="slotId" class="ad-widget-inner">
		<!-- We completely regenerate it when the slot ID changes -->
		<!-- Load the ad component for the currently running ad adapter -->
		<component :is="adComponent" :ad-slot="adSlot" :adapter="adapter" />
	</div>
</template>
