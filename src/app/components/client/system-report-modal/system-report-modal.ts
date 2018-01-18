import { Component } from 'vue-property-decorator';
import View from '!view!./system-report-modal.html';

import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Translate } from '../../../../lib/gj-lib-client/components/translate/translate.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormClientSystemReport } from './system-report-form';

@View
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
