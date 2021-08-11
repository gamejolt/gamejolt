import { Options, Prop, Vue } from 'vue-property-decorator';
import { number } from '../../../../../_common/filters/number';
import AppGraph from '../../../../../_common/graph/graph.vue';
import { Screen } from '../../../../../_common/screen/screen-service';

@Options({
	components: {
		AppGraph,
	},
	filters: {
		number,
	},
})
export default class AppAnalyticsReportTopComposition extends Vue {
	@Prop(Object) reportData!: any;

	readonly Screen = Screen;
}
