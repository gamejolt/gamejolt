import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
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
