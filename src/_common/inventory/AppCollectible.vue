<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppPopper from '../popper/AppPopper.vue';
import { Screen } from '../screen/screen-service';
import AppCollectibleDetails from './AppCollectibleDetails.vue';
import AppCollectibleImg from './AppCollectibleImg.vue';
import { InventoryCollectible } from './collectible.model';
import { CollectibleDetailsModal } from './details-modal/details-modal.service';

const props = defineProps({
	collectible: {
		type: Object as PropType<InventoryCollectible>,
		required: true,
	},
});

const { collectible } = toRefs(props);

const doPopover = computed(() => !Screen.isMobile);

function showModal() {
	if (doPopover.value) {
		return;
	}
	CollectibleDetailsModal.show({ collectible: collectible.value });
}
</script>

<template>
	<div class="_collectible">
		<component :is="doPopover ? AppPopper : 'div'">
			<AppCollectibleImg :collectible="collectible" @click="showModal" />

			<template #popover>
				<AppCollectibleDetails :collectible="collectible" do-max-width />
			</template>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
._collectible
	cursor: pointer
	filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 1px 8px rgba(0, 0, 0, 0.09))
</style>
