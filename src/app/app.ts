import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./app.html';

import { AppShell } from './components/shell/shell';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { loadCurrentLanguage } from '../utils/translations';
import { AppTheme } from '../lib/gj-lib-client/components/theme/theme';

@View
@Component({
	components: {
		AppTheme,
		AppShell,
		AppErrorPage,
	},
})
export class App extends Vue {
	// On SSR we want to set mount point for the app to this component so that
	// we can hydrate the component. On browser we want to set the "app" in the
	// index template.
	get id() {
		return GJ_IS_SSR ? 'app' : undefined;
	}

	created() {
		if (!GJ_IS_SSR) {
			Analytics.trackTiming('shell', 'vue-init', Date.now() - window._gjStartTime);
		}
	}

	mounted() {
		// Let it finish doing all the initial rendering junk and track after
		// that.
		setTimeout(() => {
			Analytics.trackTiming('shell', 'vue-mounted', Date.now() - window._gjStartTime);
		});

		loadCurrentLanguage(this);
	}
}
