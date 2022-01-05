import { mixins, Options, Prop } from 'vue-property-decorator';
import { showInfoGrowl } from '../../growls/growls.service';
import { BaseModal } from '../../modal/base';
import { User } from '../../user/user.model';
import AppBlockForm from '../form/form.vue';

@Options({
	components: {
		AppBlockForm,
	},
})
export default class AppReportModal extends mixins(BaseModal) {
	@Prop(User)
	user!: User;

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
