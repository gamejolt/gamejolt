import { Options, Vue } from 'vue-property-decorator';
import { shouldShowAppPromotion } from '../../../../utils/mobile-app';
import { trackAppPromotionClick } from '../../../../_common/analytics/analytics.service';
import AppAppButtons from '../../../../_common/app-buttons/app-buttons.vue';
import AppContactLink from '../../../../_common/contact-link/contact-link.vue';
import { formatDate } from '../../../../_common/filters/date';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import AppTranslateLangSelector from '../../../../_common/translate/lang-selector/lang-selector.vue';
import { imageJolt } from '../../../img/images';

const ClientSystemReportModal = GJ_IS_DESKTOP_APP
	? (await import('../../client/system-report-modal/system-report-modal.service'))
			.ClientSystemReportModal
	: undefined;

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
	readonly formatDate = formatDate;
	readonly trackAppPromotionClick = trackAppPromotionClick;
	readonly imageJolt = imageJolt;

	get clientVersion() {
		return GJ_VERSION;
	}

	get shouldShowAppPromotion() {
		return shouldShowAppPromotion(this.$route);
	}

	async showSystemReport() {
		ClientSystemReportModal?.show();
	}
}
