<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import FormCommunityBlock from '../../forms/community/ban/FormCommunityBlock.vue';

defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const modal = useModal()!;

function onFormSubmit() {
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
		<div class="modal-header">
			<h2 class="modal-title">
				{{ $gettext(`Block User`) }}
			</h2>
		</div>
		<div class="modal-body">
			<FormCommunityBlock :community="community" :user="user" @submit="onFormSubmit" />
		</div>
	</AppModal>
</template>
