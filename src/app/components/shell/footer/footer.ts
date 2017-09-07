import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./footer.html?style=./footer.styl';

import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTranslateLangSelector } from '../../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';
import { date } from '../../../../lib/gj-lib-client/vue/filters/date';
import { AppAd } from '../../../../lib/gj-lib-client/components/ad/ad';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';

const AdRoutes: string[] = [
	'activity',
	'discover.home',
	'discover.games.list._fetch',
	'discover.games.list._fetch-category',
	'discover.games.list._fetch-date',
	'discover.devlogs.overview',
	'discover.devlogs.games',
	'discover.channels.view.overview',
	'discover.channels.view.games',
	'discover.channels.view.devlogs',
];

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

	get shouldShowAd() {
		return !Screen.isXs && AdRoutes.indexOf(this.$route.name!) !== -1;
	}

	showSystemReport() {
		if (GJ_IS_CLIENT) {
			// TODO(rewrite)
			// getProvider<any>( 'Client_SystemReportModal' ).show();
		}
	}
}
