import AppGraph from 'game-jolt-frontend-lib/components/graph/graph.vue';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
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
