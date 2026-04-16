<script lang="ts" setup>
import FormCommunityBlock from '~app/components/forms/community/ban/FormCommunityBlock.vue';
import AppButton from '~common/button/AppButton.vue';
import { CommunityModel } from '~common/community/community.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';

type Props = {
	community: CommunityModel;
	user: UserModel;
};
defineProps<Props>();

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
