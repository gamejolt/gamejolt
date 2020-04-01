import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { AdSlot } from '../ad-slot-info';
import { AdProperAdapter, ProperTagUnits } from './proper-adapter';

type TagPlacement = keyof typeof ProperTagUnits;

@Component({})
export default class AppAdProper extends Vue {
	@Prop(propRequired(AdSlot)) adSlot!: AdSlot;
	@Prop(propRequired(AdProperAdapter)) adapter!: AdProperAdapter;

	tagPlacement: TagPlacement | null = null;
	tagUnit: string | null = null;
	tagId: string | null = null;

	created() {
		const { placement, size } = this.adSlot;

		let tagPlacement: TagPlacement;
		if (placement === 'top') {
			if (size === 'leaderboard') {
				tagPlacement = 'leaderboard';
			} else {
				tagPlacement = 'content';
			}
		} else {
			tagPlacement = placement;
		}

		const tagUnit = this.adapter.tagUnits[tagPlacement].shift() || null;
		if (!tagUnit) {
			return;
		}

		this.tagPlacement = tagPlacement;
		this.tagUnit = tagUnit;
		this.tagId = `gamejolt_${this.tagUnit}`;
	}

	mounted() {
		if (!this.tagId) {
			return;
		}

		this.doProperDisplay(this.tagId);
	}

	beforeDestroy() {
		if (!this.tagPlacement || !this.tagUnit || !this.tagId) {
			return;
		}

		this.adapter.tagUnits[this.tagPlacement].unshift(this.tagUnit);
		this.doProperDelete(this.tagId);

		this.tagPlacement = null;
		this.tagUnit = null;
		this.tagId = null;
	}

	private doProperDisplay(tagId: string) {
		this.adapter.run(() => {
			(window as any).proper_display(tagId);
		});
	}

	private doProperDelete(tagId: string) {
		this.adapter.run(() => {
			(window as any).properDestroyDfpSlot(tagId);
			(window as any).properDeleteSlot(tagId);
		});
	}
}
