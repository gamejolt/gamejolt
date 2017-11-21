import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./footer.html?style=./footer.styl';

import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTranslateLangSelector } from '../../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';
import { date } from '../../../../lib/gj-lib-client/vue/filters/date';
import { AppAd } from '../../../../lib/gj-lib-client/components/ad/ad';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';

@View
@Component({
	components: {
		AppJolticon,
		AppTranslateLangSelector,
		AppAd,
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
	Screen = makeObservableService(Screen);

	get clientVersion() {
		return GJ_VERSION;
	}

	async showSystemReport() {
		if (GJ_IS_CLIENT) {
			const m = await import('../../client/system-report-modal/system-report-modal.service');
			m.ClientSystemReportModal.show();
		}
	}
}
