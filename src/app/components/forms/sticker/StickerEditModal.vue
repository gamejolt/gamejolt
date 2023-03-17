<script lang="ts" setup>
import { computed, PropType, ref, Ref, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { ModelData, UnknownModelData } from '../../../../_common/model/model.service';
import { StickerPack } from '../../../../_common/sticker/pack/pack.model';
import { Sticker } from '../../../../_common/sticker/sticker.model';
import FormSticker from './FormSticker.vue';

const props = defineProps({
	sticker: {
		type: Object as PropType<Sticker>,
		default: undefined,
	},
	stickers: {
		type: Array as PropType<Sticker[]>,
		default: undefined,
	},
	updatePack: {
		type: Function as PropType<(pack: StickerPack | undefined) => void>,
		default: undefined,
	},
});

const { sticker, stickers, updatePack } = toRefs(props);

const modal = useModal()!;

const newSticker = ref() as Ref<Sticker | undefined>;
const model = computed(() => sticker?.value || newSticker.value);

function onFormChanged(data: UnknownModelData | ModelData<Sticker>) {
	if (model.value) {
		model.value.assign(data);
	} else {
		newSticker.value = new Sticker(data);
		stickers?.value?.unshift(newSticker.value);
	}
}

function onPackChanged(data: StickerPack | undefined) {
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
			<FormSticker :model="model" @changed="onFormChanged" @pack="onPackChanged" />
		</div>
	</AppModal>
</template>
