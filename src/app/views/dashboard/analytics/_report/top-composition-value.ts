import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatCurrency } from '../../../../../_common/filters/currency';
import { Screen } from '../../../../../_common/screen/screen-service';

@Options({})
export default class AppAnalyticsReportTopCompositionValue extends Vue {
	@Prop(Object) reportData!: any;

	readonly Screen = Screen;
	readonly number = numberformatNumberdonly formatCurrency = formatCurrency;
}
