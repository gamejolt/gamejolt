<script lang="ts" setup>
import { ref } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import AppFormContentEditorCustomButton from '~common/content/content-editor/modals/custom-button/AppFormContentEditorCustomButton.vue';
import { CustomButtonData } from '~common/content/content-editor/modals/custom-button/custom-button-modal.service';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';

type Props = {
	customButtonId: string;
};
const { customButtonId } = defineProps<Props>();

const modal = useModal()!;

const customButtonData = ref<CustomButtonData>({
	customButtonId: customButtonId,
});

function onSubmit(data: CustomButtonData) {
	console.log('Resolved modal with data:', data);
	modal.resolve(data);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<AppFormContentEditorCustomButton :model="customButtonData" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
