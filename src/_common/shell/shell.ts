import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppGrowls from '../growls/growls.vue';
import AppLoadingBar from '../loading/bar/bar.vue';
import AppModals from '../modal/modals';
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
	},
})
export default class AppCommonShell extends Vue {}
