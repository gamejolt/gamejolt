<script lang="ts" setup>
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import FormChatCommands from '../FormChatCommands.vue';

const modal = useModal()!;
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
				{{ $gettext(`Chat commands`) }}
			</h2>
		</div>

		<div class="modal-body">
			<FormChatCommands />
		</div>
	</AppModal>
</template>
