import { number } from '../../../../../_common/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	filters: {
		number,
	},
})
export default class AppAnalyticsReportRatingBreakdown extends Vue {
	@Prop(Object) reportData!: any;
}
