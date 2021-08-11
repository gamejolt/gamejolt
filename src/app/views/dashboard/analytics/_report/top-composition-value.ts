import { Options, Prop, Vue } from 'vue-property-decorator';
import { currency } from '../../../../../_common/filters/currency';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';

@Options({
	filters: {
		number,
		currency,
	},
})
export default class AppAnalyticsReportTopCompositionValue extends Vue {
	@Prop(Object) reportData!: any;

	readonly Screen = Screen;
}
