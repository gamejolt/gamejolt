import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./top-composition.html';

import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { currency } from '../../../../../lib/gj-lib-client/vue/filters/currency';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';

@View
@Component({
	filters: {
		number,
		currency,
	},
})
export class AppAnalyticsReportTopCompositionValue extends Vue {
	@Prop(Object) reportData: any;

	readonly Screen = Screen;
}
