<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { showInfoGrowl } from '../../growls/growls.service';
import { $gettext } from '../../translate/translate.service';
import { UserModel } from '../../user/user.model';
import AppBlockForm from '../form/form.vue';

import AppButton from '../../button/AppButton.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const modal = useModal()!;

const { user } = toRefs(props);

function onSubmittedBlock() {
	showInfoGrowl(
		$gettext(`You blocked %{ user }!`, {
			user: user.value.username,
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
