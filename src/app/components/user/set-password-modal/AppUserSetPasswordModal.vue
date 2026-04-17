<script lang="ts" setup>
import FormSetPassword from '~app/components/forms/set-password/FormSetPassword.vue';
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';

const modal = useModal()!;

function onPasswordSet() {
	modal.resolve(true);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title"><AppTranslate>Set Password</AppTranslate></h2>
		</div>

		<div class="modal-body">
			<p class="help-block">
				<AppTranslate>
					You don't have a password set on your account since you had signed up through a
					linked account.
				</AppTranslate>
				<br />
				<AppTranslate>
					To continue being able to log in after you've unlinked, please set a password.
				</AppTranslate>
			</p>

			<FormSetPassword @submit="onPasswordSet" />
		</div>
	</AppModal>
</template>
