<script lang="ts" setup>
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import FormChatTimers from '../FormChatTimers.vue';

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
				{{ $gettext(`Chat timers`) }}
			</h2>
		</div>

		<div class="modal-body">
			<FormChatTimers />
		</div>
	</AppModal>
</template>
