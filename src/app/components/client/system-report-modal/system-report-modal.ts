import { mixins, Options } from 'vue-property-decorator';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { BaseModal } from '../../../../_common/modal/base';
import { Translate } from '../../../../_common/translate/translate.service';
import FormClientSystemReport from './system-report-form.vue';

@Options({
	components: {
		FormClientSystemReport,
	},
})
export default class AppClientSystemReportModal extends mixins(BaseModal) {
	onSubmit() {
		showSuccessGrowl(
			Translate.$gettext('system_report.sent_growl'),
			Translate.$gettext('system_report.sent_growl_title')
		);
		this.modal.dismiss();
	}
}
