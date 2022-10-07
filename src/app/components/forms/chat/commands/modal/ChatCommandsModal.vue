<script lang="ts" setup>
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppTranslate from '../../../../../../_common/translate/AppTranslate.vue';
import AppFormChatCommands from '../AppFormChatCommands.vue';

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate>Chat commands</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<AppFormChatCommands />
		</div>
	</AppModal>
</template>
