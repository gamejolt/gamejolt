<script lang="ts" setup>
import { computed, PropType, ref, Ref, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { ModelData, UnknownModelData } from '../../../../_common/model/model.service';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import FormSticker from './FormSticker.vue';

const props = defineProps({
	sticker: {
		type: Object as PropType<StickerModel>,
		default: undefined,
	},
	stickers: {
		type: Array as PropType<StickerModel[]>,
		default: undefined,
	},
	updatePack: {
		type: Function as PropType<(pack: StickerPackModel | undefined) => void>,
		default: undefined,
	},
	emojiPrefix: {
		type: String,
		default: undefined,
	},
	canActivate: {
		type: Boolean,
	},
	warnDeactivate: {
		type: Boolean,
	},
});

const { sticker, stickers, updatePack, emojiPrefix, canActivate, warnDeactivate } = toRefs(props);

const modal = useModal()!;

const newSticker = ref() as Ref<StickerModel | undefined>;
const model = computed(() => sticker?.value || newSticker.value);

function onFormChanged(data: UnknownModelData | ModelData<StickerModel>) {
	if (model.value) {
		model.value.assign(data);
	} else {
		newSticker.value = new StickerModel(data);
		stickers?.value?.unshift(newSticker.value);
	}
}

function onPackChanged(data: StickerPackModel | undefined) {
	updatePack?.value?.(data);
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
