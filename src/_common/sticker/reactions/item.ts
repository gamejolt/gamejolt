import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { formatFuzzynumber } from '../../filters/fuzzynumber';

@Options({})
export default class AppStickerReactionsItem extends Vue {
	@Prop({ type: Number, required: true }) count!: number;
	@Prop({ type: String, required: true }) imgUrl!: string;
	@Prop({ type: Boolean, default: false }) animate!: boolean;

	timer: NodeJS.Timer | null = null;

	hasQueuedTimer = false;
	shouldAnimate = false;

	get displayCount() {
		return formatFuzzynumber(this.count);
	}

	mounted() {
		if (this.animate) {
			this.animateItem();
		}
	}

	private animateItem() {
		if (!this.animate) {
			this.clearTimer();
			return;
		}

		if (this.timer != null) {
			this.hasQueuedTimer = true;
			return;
		}

		this.shouldAnimate = true;
		this.timer = setTimeout(() => {
			this.clearTimer();
			if (this.hasQueuedTimer) {
				this.hasQueuedTimer = false;
				this.animateItem();
				return;
			}

			this.shouldAnimate = false;
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
