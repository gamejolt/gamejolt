import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';
import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { formatDate } from '../../filters/date';

@Options({})
export class AppTimeAgo extends Vue {
	@Prop({ type: [Number, Date], required: true })
	date!: number | Date;

	@Prop({ type: Boolean, required: false })
	withoutSuffix?: boolean;

	@Prop({ type: Boolean, required: false })
	strict?: boolean;

	@Prop({ type: Boolean, required: false })
	isFuture?: boolean;

	private timeout?: number;
	private timeAgo = '';
	private fixedTime = '';

	created() {
		this.refresh();
	}

	unmounted() {
		this.clearTimeout();
	}

	@Watch('date')
	onDateChanged() {
		this.clearTimeout();
		this.refresh();
	}

	private clearTimeout() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
	}

	private refresh() {
		const time = this.strict
			? formatDistanceStrict(new Date(), this.date)
			: formatDistanceToNow(this.date);

		if (this.withoutSuffix) {
			this.timeAgo = time;
		} else if (this.isFuture) {
			this.timeAgo = this.$gettextInterpolate('%{ time } left', { time });
		} else {
			this.timeAgo = this.$gettextInterpolate('%{ time } ago', { time });
		}

		// In minutes.
		const input = this.date instanceof Date ? this.date.getTime() : this.date;
		const diff = (Date.now() - input) / 1000 / 60;

		let secondsUntilUpdate = 3600;
		if (diff < 1) {
			secondsUntilUpdate = 1;
		} else if (diff < 60) {
			secondsUntilUpdate = 30;
		} else if (diff < 180) {
			secondsUntilUpdate = 300;
		}

		this.fixedTime = formatDate(this.date, 'medium');

		if (!import.meta.env.SSR) {
			this.timeout = window.setTimeout(() => this.refresh(), secondsUntilUpdate * 1000);
		}
	}

	render() {
		return h(
			'span',
			{
				title: this.fixedTime,
			},
			this.timeAgo
		);
	}
}
