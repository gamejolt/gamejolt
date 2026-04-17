<script lang="ts" setup>
import AppAuthJoin from '~common/auth/join/AppAuthJoin.vue';
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';

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
