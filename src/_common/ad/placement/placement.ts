import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Screen } from '../../screen/screen-service';
import { Ads } from '../ads.service';
import AppAdWidget from '../widget/widget.vue';

@Component({
	components: {
		AppAdWidget,
	},
})
export default class AppAdPlacement extends Vue {
	@Prop({ type: Boolean, default: false })
	staticSize!: boolean;

	@Prop(Boolean)
	hiddenXs?: boolean;

	@Prop(Boolean)
	hiddenSm?: boolean;

	@Prop(Boolean)
	hiddenDesktop?: boolean;

	@Prop(Boolean)
	visibleXs?: boolean;

	@Prop(Boolean)
	visibleSm?: boolean;

	@Prop(Boolean)
	visibleDesktop?: boolean;

	readonly Screen = Screen;

	get isVisible() {
		if (!Ads.shouldShow) {
			return false;
		}

		let visibleXs = true;
		let visibleSm = true;
		let visibleDesktop = true;

		if (this.visibleXs || this.visibleSm || this.visibleDesktop) {
			visibleXs = !!this.visibleXs;
			visibleSm = !!this.visibleSm;
			visibleDesktop = !!this.visibleDesktop;
		} else {
			visibleXs = !this.hiddenXs;
			visibleSm = !this.hiddenSm;
			visibleDesktop = !this.hiddenDesktop;
		}

		return (
			(Screen.isXs && visibleXs) ||
			(Screen.isSm && visibleSm) ||
			(Screen.isDesktop && visibleDesktop)
		);
	}
}
