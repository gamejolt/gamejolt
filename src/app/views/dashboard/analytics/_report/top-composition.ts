import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import AppGraph from '../../../../../_common/graph/graph.vue';
import { Screen } from '../../../../../_common/screen/screen-service';

@Options({
	components: {
		AppGraph,
	},
})
export default class AppAnalyticsReportTopComposition extends Vue {
	@Prop(Object) reportData!: any;

	readonly Screen = Screen;
	readonly number = formatNumber;

	isScalarLabel(val: any) {
		return typeof val.label !== 'object';
	}
}
