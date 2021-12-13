import { Options, Vue } from 'vue-property-decorator';
import AppGrowls from '../growls/growls.vue';
import AppLightboxPortal from '../lightbox/lightbox-portal.vue';
import AppLoadingBar from '../loading/bar/bar.vue';
import AppModals from '../modal/modals.vue';
import AppScrollInviewParent from '../scroll/inview/parent.vue';
import { AppTheme } from '../theme/theme';
import AppTooltipPortal from '../tooltip/tooltip-portal.vue';

@Options({
	components: {
		AppScrollInviewParent,
		AppTheme,
		AppGrowls,
		AppLoadingBar,
		AppModals,
		AppTooltipPortal,
		AppLightboxPortal,
	},
})
export default class AppCommonShell extends Vue {}
