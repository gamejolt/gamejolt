import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { Screen } from '../../screen/screen-service';
import { AdSlotMeta } from '../ad-slot-info';
import AppAdWidget from '../widget/widget.vue';

@Component({
	components: {
		AppAdWidget,
	},
})
export default class AppAdPlacement extends Vue {
	@Prop(propOptional(Object, () => {})) meta!: AdSlotMeta;
	@Prop(propOptional(Boolean, false)) hiddenXs!: boolean;
	@Prop(propOptional(Boolean, false)) hiddenSm!: boolean;
	@Prop(propOptional(Boolean, false)) hiddenDesktop!: boolean;
	@Prop(propOptional(Boolean, false)) visibleXs!: boolean;
	@Prop(propOptional(Boolean, false)) visibleSm!: boolean;
	@Prop(propOptional(Boolean, false)) visibleDesktop!: boolean;

	readonly Screen = Screen;

	get isVisible() {
		if (!this.$ad.shouldShow) {
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
