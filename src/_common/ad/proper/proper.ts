import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { AdSlot } from '../ad-slot-info';
import { AdProperAdapter, AdProperAdapterPlacement } from './proper-adapter';

@Component({})
export default class AppAdProper extends Vue {
	@Prop(propRequired(AdSlot)) adSlot!: AdSlot;
	@Prop(propRequired(AdProperAdapter)) adapter!: AdProperAdapter;

	counter = 0;

	get placement() {
		const { size } = this.adSlot;
		let placement: AdProperAdapterPlacement = 'content_1';
		if (size === 'leaderboard') {
			placement = 'leaderboard';
		}
		return placement;
	}

	get tagId() {
		return `gamejolt_${this.placement}-${this.counter}`;
	}

	created() {
		// We have to increment a new counter ID for each new ad we show.
		this.counter = ++this.adapter.tagCounts[this.placement];
	}

	mounted() {
		this.adapter.ensureLoaded();

		const w = window as any;
		w.propertag.cmd.push(() => w.proper_display(this.tagId));
		console.log('displaying', this.tagId);
	}
}
