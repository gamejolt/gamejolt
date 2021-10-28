import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { fuzzynumber } from '../../filters/fuzzynumber';

@Component({})
export default class AppStickerReactionsItem extends Vue {
	@Prop(propRequired(Number)) count!: number;
	@Prop(propRequired(String)) imgUrl!: string;
	@Prop(propOptional(Boolean, false)) animate!: boolean;

	timer: NodeJS.Timer | null = null;
	$el!: HTMLDivElement;

	get shouldAnimate() {
		return !!this.timer;
	}

	get displayCount() {
		return fuzzynumber(this.count);
	}

	mounted() {
		if (this.animate) {
			this.animateItem();
		}
	}

	private animateItem() {
		this.clearTimer();
		if (!this.animate) {
			return;
		}

		this.timer = setTimeout(() => {
			this.clearTimer();
		}, 2_000);
	}

	private clearTimer() {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = null;
	}

	@Watch('count')
	onCountChanged() {
		if (this.animate) {
			this.animateItem();
		}
	}
}
