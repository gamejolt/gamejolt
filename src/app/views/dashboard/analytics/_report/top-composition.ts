import AppGraph from '../../../../../_common/graph/graph.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { number } from '../../../../../_common/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
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
