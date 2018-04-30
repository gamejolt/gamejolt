import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./footer.html?style=./footer.styl';

import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTranslateLangSelector } from '../../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';
import { date } from '../../../../lib/gj-lib-client/vue/filters/date';
import { AppAd } from '../../../../lib/gj-lib-client/components/ad/ad';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import * as _ClientSystemReportModalMod from '../../client/system-report-modal/system-report-modal.service';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';

let ClientSystemReportModalMod: typeof _ClientSystemReportModalMod | undefined;
if (GJ_IS_CLIENT) {
	ClientSystemReportModalMod = require('../../client/system-report-modal/system-report-modal.service');
}

@View
@Component({
	components: {
		AppJolticon,
		AppTranslateLangSelector,
		AppAd,
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
