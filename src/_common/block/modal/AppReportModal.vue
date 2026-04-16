<script lang="ts" setup>
import AppBlockForm from '~common/block/form/AppBlockForm.vue';
import AppButton from '~common/button/AppButton.vue';
import { showInfoGrowl } from '~common/growls/growls.service';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';

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
