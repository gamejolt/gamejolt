import { createComponent, onMounted } from '@vue/composition-api';
import { loadCurrentLanguage } from '../utils/translations';
import { Playwire } from '../_common/ad/playwire/playwire.service';
import { Analytics } from '../_common/analytics/analytics.service';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import AppErrorPage from '../_common/error/page/page.vue';
import { AppTheme } from '../_common/theme/theme';
import AppShell from './components/shell/shell.vue';

const App = createComponent({
	components: {
		AppTheme,
		AppShell,
		AppErrorPage,
		AppCookieBanner,
	},
	setup(_, { root }) {
		// On SSR we want to set mount point for the app to this component so that
		// we can hydrate the component. On browser we want to set the "app" in the
		// index template.
		const id = GJ_IS_SSR ? 'app' : 'not-app';

		if (!GJ_IS_SSR) {
			Analytics.trackTiming('shell', 'vue-init', Date.now() - window._gjStartTime);
		}

		onMounted(() => {
			Playwire.init(root.$router);

			// Let it finish doing all the initial rendering junk and track after
			// that.
			setTimeout(() => {
				Analytics.trackTiming('shell', 'vue-mounted', Date.now() - window._gjStartTime);
			});

			loadCurrentLanguage(root);
		});

		return {
			id,
		};
	},
});

export default App;
