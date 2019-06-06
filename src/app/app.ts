import { Playwire } from 'game-jolt-frontend-lib/components/ad/playwire/playwire.service';
import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import AppErrorPage from 'game-jolt-frontend-lib/components/error/page/page.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { loadCurrentLanguage } from '../utils/translations';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import AppShell from './components/shell/shell.vue';

@Component({
	components: {
		AppTheme,
		AppShell,
		AppErrorPage,
		AppCookieBanner,
	},
})
export default class App extends Vue {
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
		Playwire.init(this.$router);

		// Let it finish doing all the initial rendering junk and track after
		// that.
		setTimeout(() => {
			Analytics.trackTiming('shell', 'vue-mounted', Date.now() - window._gjStartTime);
		});

		loadCurrentLanguage(this);
	}
}
