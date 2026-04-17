<script lang="ts" setup>
import { ref } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import AppCollectibleResourceThumbDetails from '~common/collectible/AppCollectibleResourceDetails.vue';
import { CollectibleResourceItem } from '~common/collectible/resource-details-modal/modal.service';
import AppModal from '~common/modal/AppModal.vue';
import AppModalFloatingHeader from '~common/modal/AppModalFloatingHeader.vue';
import { useModal } from '~common/modal/modal.service';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	item: CollectibleResourceItem;
};
const { item } = defineProps<Props>();

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
