<script lang="ts" setup>
import AppButton from '../../../../button/AppButton.vue';
import AppModal from '../../../../modal/AppModal.vue';
import { useModal } from '../../../../modal/modal.service';
import FormUserAvatarFrame from '../FormUserAvatarFrame.vue';

const modal = useModal()!;
</script>

<template>
	<!-- TODO(avatar-frames) use or remove -->
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ $gettext(`Choose your avatar frame`) }}
			</h2>
		</div>

		<div class="modal-body">
			<FormUserAvatarFrame />
		</div>
	</AppModal>
</template>
