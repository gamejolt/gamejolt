import { Options, Prop, Vue } from 'vue-property-decorator';
import { currency } from '../../../../../_common/filters/currency';
import { number } from '../../../../../_common/filters/number';

@Options({
	filters: {
		number,
		currency,
	},
})
export default class AppAnalyticsReportSimpleStat extends Vue {
	@Prop(Object) reportData!: any;
}
