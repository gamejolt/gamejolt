import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppAppButtons from '../../../../_common/app-buttons/app-buttons.vue';
import AppContactLink from '../../../../_common/contact-link/contact-link.vue';
import { date } from '../../../../_common/filters/date';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import AppTranslateLangSelector from '../../../../_common/translate/lang-selector/lang-selector.vue';
import * as _ClientSystemReportModalMod from '../../client/system-report-modal/system-report-modal.service';

let ClientSystemReportModalMod: typeof _ClientSystemReportModalMod | undefined;
if (GJ_IS_CLIENT) {
	ClientSystemReportModalMod = require('../../client/system-report-modal/system-report-modal.service');
}

@Component({
	components: {
		AppAppButtons,
		AppTranslateLangSelector,
		AppThemeSvg,
		AppContactLink,
	},
})
export default class AppShellFooter extends Vue {
	curDate = new Date();

	readonly Screen = Screen;
	readonly date = date;
	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;

	get clientVersion() {
		return GJ_VERSION;
	}

	async showSystemReport() {
		if (ClientSystemReportModalMod) {
			ClientSystemReportModalMod.ClientSystemReportModal.show();
		}
	}
}
