<script lang="ts" setup>
import FormUserHeader from '~app/components/forms/user-header/FormUserHeader.vue';
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { useCommonStore } from '~common/store/common-store';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { UserModel } from '~common/user/user.model';

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
