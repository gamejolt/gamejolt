import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatCurrency } from '../../../../../_common/filters/currency';
import { formatNumber } from '../../../../../_common/filters/number';

@Options({})
export default class AppAnalyticsReportSimpleStat extends Vue {
	@Prop(Object) reportData!: any;

	readonly number = formatNumber;
	readonly currency = formatCurrency;
}
