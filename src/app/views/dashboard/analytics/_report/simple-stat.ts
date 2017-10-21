import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./simple-stat.html';

import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { currency } from '../../../../../lib/gj-lib-client/vue/filters/currency';

@View
@Component({
	filters: {
		number,
		currency,
	},
})
export class AppAnalyticsReportSimpleStat extends Vue {
	@Prop(Object) reportData: any;
}
