import { Growls } from '../../../../_common/growls/growls.service';
import { BaseModal } from '../../../../_common/modal/base';
import { Translate } from '../../../../_common/translate/translate.service';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';
import { Component } from 'vue-property-decorator';
import FormClientSystemReport from './system-report-form.vue';

@Component({
	components: {
		AppJolticon,
		FormClientSystemReport,
	},
})
export default class AppClientSystemReportModal extends BaseModal {
	onSubmit() {
		Growls.success(
			Translate.$gettext('system_report.sent_growl'),
			Translate.$gettext('system_report.sent_growl_title')
		);
		this.modal.dismiss();
	}
}
