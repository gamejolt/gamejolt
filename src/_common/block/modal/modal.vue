<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { showInfoGrowl } from '../../growls/growls.service';
import { BaseModal } from '../../modal/base';
import { UserModel } from '../../user/user.model';
import AppBlockForm from '../form/form.vue';

@Options({
	components: {
		AppBlockForm,
	},
})
export default class AppReportModal extends mixins(BaseModal) {
	@Prop(Object)
	user!: UserModel;

	onSubmittedBlock() {
		showInfoGrowl(
			this.$gettextInterpolate(`You blocked %{ user }!`, {
				user: this.user.username,
			}),
			this.$gettext('Blocked')
		);

		this.modal.resolve(true);
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

		<div class="modal-body">
			<AppBlockForm :user="user" @submit="onSubmittedBlock" />
		</div>
	</AppModal>
</template>
