import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppCountdown extends Vue {
	@Prop(Number) end!: number;

	private time = '';
	private interval?: number;

	created() {
		this.updateTimer();
	}

	mounted() {
		this.interval = window.setInterval(() => this.updateTimer(), 1000);
	}

	destroyed() {
		if (this.interval) {
			window.clearInterval(this.interval);
		}
	}

	render(h: CreateElement) {
		return h('span', this.time);
	}

	updateTimer() {
		let timeLeft = (this.end - Date.now()) / 1000;
		if (timeLeft < 0) {
			this.time = '0:0:0';
			return;
		}

		// Only show days left if there's more than 3 days.
		let daysLeft = 0;
		if (Math.floor(timeLeft / 86400) > 3) {
			daysLeft = Math.floor(timeLeft / 86400);
			if (daysLeft) {
				timeLeft -= daysLeft * 86400;
			}
		}

		const hoursLeft = Math.floor(timeLeft / 3600);
		if (hoursLeft) {
			timeLeft -= hoursLeft * 3600;
		}

		const minutesLeft = Math.floor(timeLeft / 60);
		if (minutesLeft) {
			timeLeft -= minutesLeft * 60;
		}

		const secondsLeft = Math.floor(timeLeft);

		let text = `${this.pad(hoursLeft)}:${this.pad(minutesLeft)}:${this.pad(secondsLeft)}`;
		if (daysLeft) {
			text = `${daysLeft}:${text}`;
		}

		this.time = text;
	}

	pad(num: number): string {
		if (num < 10) {
			return '0' + num;
		}
		return '' + num;
	}
}
