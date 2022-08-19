<script lang="ts" setup>
import { PropType } from 'vue';
import AppUserList from '../../../app/components/user/list/list.vue';
import AppButton from '../../button/AppButton.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import AppTranslate from '../../translate/AppTranslate.vue';
import { User } from '../../user/user.model';

defineProps({
	supporters: {
		type: Array as PropType<User[]>,
		required: true,
	},
});

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
				<AppTranslate> Supporters </AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<AppUserList :users="supporters" />
		</div>
	</AppModal>
</template>
