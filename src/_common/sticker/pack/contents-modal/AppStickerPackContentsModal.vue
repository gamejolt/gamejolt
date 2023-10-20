<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../button/AppButton.vue';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import AppStickerPackContents from '../AppStickerPackContents.vue';
import { StickerPackModel } from '../pack.model';

defineProps({
	pack: {
		type: Object as PropType<StickerPackModel>,
		required: true,
	},
});

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<AppStickerPackContents :pack="pack" />
		</div>
	</AppModal>
</template>
