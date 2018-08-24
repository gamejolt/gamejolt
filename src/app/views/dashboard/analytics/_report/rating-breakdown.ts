import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./rating-breakdown.html?style=./report-percentage.styl';

import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	filters: {
		number,
	},
})
export class AppAnalyticsReportRatingBreakdown extends Vue {
	@Prop(Object) reportData!: any;
}
