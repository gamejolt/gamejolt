import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';

@Options({})
export default class AppAnalyticsReportRatingBreakdown extends Vue {
	@Prop(Object) reportData!: any;

	readonly formatNumber = formatNumber;
}
