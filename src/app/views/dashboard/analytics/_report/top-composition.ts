import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./top-composition.html?style=./report-percentage.styl';

import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppGraph } from '../../../../../lib/gj-lib-client/components/graph/graph';

@View
@Component({
	components: {
		AppGraph,
	},
	filters: {
		number,
	},
})
export class AppAnalyticsReportTopComposition extends Vue {
	@Prop(Object) reportData: any;

	readonly Screen = Screen;
}
