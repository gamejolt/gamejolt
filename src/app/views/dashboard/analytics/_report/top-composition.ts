import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./top-composition.html?style=./report-percentage.styl';

import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
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

	Screen = makeObservableService(Screen);
}
