import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { AdSlot } from '../ad-slot-info';
import { AdPlaywireAdapter } from './playwire-adapter';

@Component({})
export default class AppAdPlaywire extends Vue {
	@Prop(propRequired(AdSlot)) adSlot!: AdSlot;
	@Prop(propRequired(AdPlaywireAdapter)) adapter!: AdPlaywireAdapter;

	/**
	 * This is a Playwire placement key and must match their system.
	 */
	get placement() {
		const { size, meta } = this.adSlot;

		if (size === 'rectangle') {
			// We got Playwire to make it so that "btf" ads will never change
			// size. We can use this when there is content below it that we
			// never want being pushed around, such as feeds.
			const position = meta.staticSize ? 'btf' : 'atf';
			return `med_rect_${position}`;
		}

		// Footer is a special case ad that should show below all content, right
		// above the footer.
		if (size === 'footer') {
			return 'leaderboard_btf';
		}

		return 'leaderboard_atf';
	}

	mounted() {
		this.adapter.ensureLoaded();
	}
}
