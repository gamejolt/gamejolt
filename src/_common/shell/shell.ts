import { Options, Vue } from 'vue-property-decorator';
import AppGrowls from '../growls/growls.vue';
import AppLoadingBar from '../loading/bar/bar.vue';
import AppModals from '../modal/modals.vue';
import { AppScrollInviewParent } from '../scroll/inview/parent';
import { AppTheme } from '../theme/theme';

@Options({
	components: {
		AppScrollInviewParent,
		AppTheme,
		AppGrowls,
		AppLoadingBar,
		AppModals,
	},
})
export default class AppCommonShell extends Vue {}
