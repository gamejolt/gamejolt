import View from '!view!./footer.html?style=./footer.styl';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';
import { AppTranslateLangSelector } from '../../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';
import { date } from '../../../../lib/gj-lib-client/vue/filters/date';
import * as _ClientSystemReportModalMod from '../../client/system-report-modal/system-report-modal.service';

let ClientSystemReportModalMod: typeof _ClientSystemReportModalMod | undefined;
if (GJ_IS_CLIENT) {
	ClientSystemReportModalMod = require('../../client/system-report-modal/system-report-modal.service');
}

@View
@Component({
	components: {
		AppTranslateLangSelector,
		AppThemeSvg,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		date,
	},
})
export class AppShellFooter extends Vue {
	curDate = new Date();
	readonly Screen = Screen;

	get clientVersion() {
		return GJ_VERSION;
	}

	async showSystemReport() {
		if (ClientSystemReportModalMod) {
			ClientSystemReportModalMod.ClientSystemReportModal.show();
		}
	}
}
