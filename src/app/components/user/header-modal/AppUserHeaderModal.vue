<script lang="ts" setup>
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { UserModel } from '../../../../_common/user/user.model';
import FormUserHeader from '../../forms/user-header/FormUserHeader.vue';

const modal = useModal()!;
const { user: appUser } = useCommonStore();

let previousHeaderId: number | null = null;

if (appUser.value && appUser.value.header_media_item) {
	previousHeaderId = appUser.value.header_media_item.id;
}

function onSubmit(user: UserModel) {
	const newHeaderId = (user.header_media_item && user.header_media_item.id) || null;
	if (previousHeaderId === newHeaderId) {
		modal.resolve(user);
	}
	previousHeaderId = newHeaderId;
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<FormUserHeader :model="appUser ?? undefined" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
