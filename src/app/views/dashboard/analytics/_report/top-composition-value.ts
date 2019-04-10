import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { currency } from 'game-jolt-frontend-lib/vue/filters/currency';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
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
