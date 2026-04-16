<script lang="ts" setup>
import { ref } from 'vue';

import AppButton from '../../../../button/AppButton.vue';
import AppModal from '../../../../modal/AppModal.vue';
import { useModal } from '../../../../modal/modal.service';
import AppFormContentEditorCustomButton from './AppFormContentEditorCustomButton.vue';
import { CustomButtonData } from './custom-button-modal.service';

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
