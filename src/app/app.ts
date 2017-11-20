import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./app.html';

import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { makeObservableService } from '../lib/gj-lib-client/utils/vue';
import { AppShell } from './components/shell/shell';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { AppClientIntro } from './components/client/intro/intro';
import { AppState, AppStore } from '../lib/gj-lib-client/vue/services/app/app-store';
import { loadCurrentLanguage } from '../utils/translations';
import { AppClientMigrator } from './components/client/migrator/migrator';

let components: any = {
	AppShell,
	AppErrorPage,
};

if (GJ_IS_CLIENT) {
	// TODO(rewrite,cros) - will this load the client chunks? Do I have to use require here?
	components = { ...components, AppClientIntro, AppClientMigrator };
}

@View
@Component({
	components,
})
export class App extends Vue {
	@AppState userBootstrapped: AppStore['userBootstrapped'];

	Connection = makeObservableService(Connection);

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
