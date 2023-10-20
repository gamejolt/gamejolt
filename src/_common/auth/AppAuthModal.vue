<script lang="ts" setup>
import AppButton from '../button/AppButton.vue';
import AppModal from '../modal/AppModal.vue';
import { useModal } from '../modal/modal.service';
import AppAuthJoin from './join/AppAuthJoin.vue';

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
			<div
				:style="{
					maxWidth: `350px`,
					margin: `0 auto`,
				}"
			>
				<AppAuthJoin />
			</div>
		</div>
	</AppModal>
</template>
