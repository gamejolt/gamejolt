import { Screen } from '../../../../../_common/screen/screen-service';
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
export default class AppAnalyticsReportTopCompositionValue extends Vue {
	@Prop(Object) reportData!: any;

	readonly Screen = Screen;
}
