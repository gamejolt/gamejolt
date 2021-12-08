import { Options, Vue } from 'vue-property-decorator';
import { shouldShowAppPromotion } from '../../../../utils/mobile-app';
import { trackAppPromotionClick } from '../../../../_common/analytics/analytics.service';
import AppAppButtons from '../../../../_common/app-buttons/app-buttons.vue';
import AppContactLink from '../../../../_common/contact-link/contact-link.vue';
import { formatDate } from '../../../../_common/filters/date';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import AppTranslateLangSelector from '../../../../_common/translate/lang-selector/lang-selector.vue';
import * as _ClientSystemReportModalMod from '../../client/system-report-modal/system-report-modal.service';

let ClientSystemReportModalMod: typeof _ClientSystemReportModalMod | undefined;
if (GJ_IS_CLIENT) {
	ClientSystemReportModalMod = require('../../client/system-report-modal/system-report-modal.service');
}

@Options({
	components: {
		AppAppButtons,
		AppTranslateLangSelector,
		AppThemeSvg,
		AppContactLink,
	},
})
export default class AppShellFooter extends Vue {
	curDate = new Date();

	readonly Screen = Screen;
	readonly date = formatDate;
	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;
	readonly trackAppPromotionClick = trackAppPromotionClick;

	get clientVersion() {
		return GJ_VERSION;
	}

	get shouldShowAppPromotion() {
		return shouldShowAppPromotion(this.$route);
	}

	async showSystemReport() {
		if (ClientSystemReportModalMod) {
			ClientSystemReportModalMod.ClientSystemReportModal.show();
		}
	}
}
