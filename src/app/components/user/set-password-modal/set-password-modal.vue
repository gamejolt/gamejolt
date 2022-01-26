<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';
import FormSetPassword from '../../forms/set-password/set-password.vue';

@Options({
	components: {
		FormSetPassword,
	},
})
export default class AppUserSetPasswordModal extends mixins(BaseModal) {
	onPasswordSet() {
		this.modal.resolve(true);
	}

	close() {
		this.modal.dismiss();
	}
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
					You don't have a password set on your account since you had signed up through a linked
					account.
				</AppTranslate>
				<br />
				<AppTranslate>
					To continue being able to log in after you've unlinked, please set a password.
				</AppTranslate>
			</p>

			<FormSetPassword @submit="onPasswordSet"></form-set-password>
		</div>
	</AppModal>
</template>
