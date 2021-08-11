import { Options, Prop, Vue } from 'vue-property-decorator';
import { number } from '../../../../../_common/filters/number';

@Options({
	filters: {
		number,
	},
})
export default class AppAnalyticsReportRatingBreakdown extends Vue {
	@Prop(Object) reportData!: any;
}
