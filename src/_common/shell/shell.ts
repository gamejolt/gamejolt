import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { ensureConfig } from '../config/config.service';
import AppGrowls from '../growls/growls.vue';
import AppLoadingBar from '../loading/bar/bar.vue';
import AppLoading from '../loading/loading.vue';
import AppModals from '../modal/modals.vue';
import { AppScrollInviewParent } from '../scroll/inview/parent';
import { AppTheme } from '../theme/theme';

/**
 * Includes all the common components that are required for every section.
 */
@Component({
	components: {
		AppScrollInviewParent,
		AppTheme,
		AppGrowls,
		AppLoadingBar,
		AppModals,
		AppLoading,
	},
})
export default class AppCommonShell extends Vue {
	isLoaded = GJ_IS_SSR;

	mounted() {
		// We need to wait for our remote config to populate.
		ensureConfig().finally(() => (this.isLoaded = true));
	}
}
