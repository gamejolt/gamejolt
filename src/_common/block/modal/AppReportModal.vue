<script lang="ts" setup>
import AppButton from '../../button/AppButton.vue';
import { showInfoGrowl } from '../../growls/growls.service';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { $gettext } from '../../translate/translate.service';
import { UserModel } from '../../user/user.model';
import AppBlockForm from '../form/AppBlockForm.vue';

type Props = {
	user: UserModel;
};
const { user } = defineProps<Props>();

const modal = useModal()!;

function onSubmittedBlock() {
	showInfoGrowl(
		$gettext(`You blocked %{ user }!`, {
			user: user.username,
		}),
		$gettext('Blocked')
	);

	modal.resolve(true);
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
			<AppBlockForm :user="user" @submit="onSubmittedBlock" />
		</div>
	</AppModal>
</template>
