import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { loadCurrentLanguage } from '../utils/translations';
import { Playwire } from '../_common/ad/playwire/playwire.service';
import { Analytics } from '../_common/analytics/analytics.service';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';
import { getTranslationLang } from '../_common/translate/translate.service';
import AppShell from './components/shell/shell.vue';

@Component({
	components: {
		AppCommonShell,
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
			const lang = getTranslationLang();
			if (lang !== 'en_US') {
				Analytics.trackEvent('translations', 'loaded', lang);
			}
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
