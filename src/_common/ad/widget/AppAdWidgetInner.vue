<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, PropType, ref, toRef, toRefs } from 'vue';
import { FiresidePostModel } from '../../fireside/post/post-model';
import { GameModel } from '../../game/game.model';
import { UserModel } from '../../user/user.model';
import { AdSlot } from '../ad-slot-info';
import {
	addAd,
	AdEvent,
	AdInterface,
	AdType,
	chooseAdAdapterForSlot,
	removeAd,
	sendAdBeacon,
	useAdStore,
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

const { adSlot } = toRefs(props);
const adStore = useAdStore();
const { settings } = adStore;

/**
 * We change this as the route changes. This way we can tell any of the ad
 * adapters when the slot needs to load a new ad in.
 */
const slotId = ref('');

const resourceInfo = computed(() => {
	let resource: string = undefined as any;
	let resourceId: number = undefined as any;

	const adResource = settings.value.resource;
	if (adResource instanceof GameModel) {
		resource = 'Game';
		resourceId = adResource.id;
	} else if (adResource instanceof UserModel) {
		resource = 'User';
		resourceId = adResource.id;
	} else if (adResource instanceof FiresidePostModel) {
		resource = 'Fireside_Post';
		resourceId = adResource.id;
	}

	return { resource, resourceId };
});

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

		// Log that we viewed this ad immediately.
		_sendBeacon(AdEvent.View);
	},
};

onMounted(() => {
	addAd(adStore, ad);
});

onBeforeUnmount(() => {
	removeAd(adStore, ad);
});

function _sendBeacon(event: AdEvent) {
	const { resource, resourceId } = resourceInfo.value;
	sendAdBeacon(event, AdType.Display, resource, resourceId);
}
</script>

<template>
	<div v-if="slotId" :key="slotId" class="ad-widget-inner">
		<!-- We completely regenerate it when the slot ID changes -->
		<!-- Load the ad component for the currently running ad adapter -->
		<component :is="adComponent" :ad-slot="adSlot" :adapter="adapter" />
	</div>
</template>
