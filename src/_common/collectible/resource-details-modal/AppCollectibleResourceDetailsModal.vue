<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppButton from '../../button/AppButton.vue';
import AppModal from '../../modal/AppModal.vue';
import AppModalFloatingHeader from '../../modal/AppModalFloatingHeader.vue';
import { useModal } from '../../modal/modal.service';
import { StickerPackModel } from '../../sticker/pack/pack.model';
import { $gettext } from '../../translate/translate.service';
import AppCollectibleResourceThumbDetails from '../AppCollectibleResourceDetails.vue';
import { CollectibleResourceItem } from './modal.service';

defineProps({
	item: {
		type: Object as PropType<CollectibleResourceItem>,
		required: true,
	},
});

const packs = ref<StickerPackModel[]>([]);

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<AppModalFloatingHeader>
			<template #modal-controls>
				<AppButton @click="modal.dismiss()">
					{{ $gettext(`Close`) }}
				</AppButton>
			</template>
		</AppModalFloatingHeader>

		<div class="modal-body">
			<AppCollectibleResourceThumbDetails v-model:packs="packs" :item="item" />
		</div>
	</AppModal>
</template>
