import { Component, Prop } from 'vue-property-decorator';
import { Growls } from '../../growls/growls.service';
import { BaseModal } from '../../modal/base';
import { User } from '../../user/user.model';
import AppBlockForm from '../form/form.vue';

@Component({
	components: {
		AppBlockForm,
	},
})
export default class AppReportModal extends BaseModal {
	@Prop(User)
	user!: User;

	onSubmittedBlock() {
		Growls.info(
			this.$gettextInterpolate(`You blocked %{ user }!`, {
				user: this.user.username,
			}),
			this.$gettext('Blocked')
		);

		this.modal.resolve(true);
	}
}
