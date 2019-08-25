import { currency } from '../../../../../_common/filters/currency';
import { number } from '../../../../../_common/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	filters: {
		number,
		currency,
	},
})
export default class AppAnalyticsReportSimpleStat extends Vue {
	@Prop(Object) reportData!: any;
}
