<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppButton from '../../button/AppButton.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import AppCollectibleDetails from '../AppCollectibleDetails.vue';
import { InventoryCollectible } from '../collectible.model';

const props = defineProps({
	collectible: {
		type: Object as PropType<InventoryCollectible>,
		required: true,
	},
});

const { collectible } = toRefs(props);
const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<AppCollectibleDetails :collectible="collectible" />
	</AppModal>
</template>
