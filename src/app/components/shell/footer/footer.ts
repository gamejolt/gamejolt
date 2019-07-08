import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
import AppTranslateLangSelector from 'game-jolt-frontend-lib/components/translate/lang-selector/lang-selector.vue';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as _ClientSystemReportModalMod from '../../client/system-report-modal/system-report-modal.service';

let ClientSystemReportModalMod: typeof _ClientSystemReportModalMod | undefined;
if (GJ_IS_CLIENT) {
	ClientSystemReportModalMod = require('../../client/system-report-modal/system-report-modal.service');
}

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
export default class AppShellFooter extends Vue {
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

	onClickEmail() {
		// If the <a> tag has the mailto in its href attribute,
		// on certain pages the Vue router replaces part of the url with the email address,
		// instead of redirecting to the mailto application.
		Navigate.goto('mailto:contact@gamejolt.com');
	}
}
