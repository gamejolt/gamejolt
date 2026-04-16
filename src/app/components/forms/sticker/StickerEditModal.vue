<script lang="ts" setup>
import { computed, Ref, ref } from 'vue';

import AppButton from '../../../../_common/button/AppButton.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { ModelData, UnknownModelData } from '../../../../_common/model/model.service';
import { storeModel } from '../../../../_common/model/model-store.service';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import FormSticker from './FormSticker.vue';

type Props = {
	sticker?: StickerModel;
	stickers?: StickerModel[];
	updatePack?: (pack: StickerPackModel | undefined) => void;
	emojiPrefix?: string;
	canActivate?: boolean;
	warnDeactivate?: boolean;
};
const { sticker, stickers, updatePack, emojiPrefix, canActivate, warnDeactivate } =
	defineProps<Props>();

const modal = useModal()!;

const newSticker = ref() as Ref<StickerModel | undefined>;
const model = computed(() => sticker || newSticker.value);

function onFormChanged(data: UnknownModelData | ModelData<StickerModel>) {
	if (model.value) {
		storeModel(StickerModel, data);
	} else {
		newSticker.value = storeModel(StickerModel, data);
		// eslint-disable-next-line vue/no-mutating-props
		stickers?.unshift(newSticker.value);
	}
}

function onPackChanged(data: StickerPackModel | undefined) {
	updatePack?.(data);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ model ? $gettext(`Edit sticker`) : $gettext(`Add sticker`) }}
			</h2>
		</div>

		<div class="modal-body">
			<FormSticker
				:model="model"
				:emoji-prefix="emojiPrefix"
				:can-activate="canActivate"
				:warn-deactivate="warnDeactivate"
				@changed="onFormChanged"
				@pack="onPackChanged"
			/>
		</div>
	</AppModal>
</template>
