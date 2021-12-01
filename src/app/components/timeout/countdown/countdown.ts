import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';

@Component({})
export default class AppTimeoutCountdown extends Vue {
	@Prop(propRequired(Number)) expiresOn!: number;

	updateTimer!: NodeJS.Timer | null;
	displayText = '';
	isCountedDown = false;

	mounted() {
		this.updateTimer = setInterval(() => {
			this.updateDisplayText();
		}, 1000);
		this.updateDisplayText();
	}

	destroy() {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
		}
	}

	updateDisplayText() {
		let diff = this.expiresOn - Date.now();

		/**
		 * Base display:
		 *
		 * days:hours:minutes:seconds
		 * each number is padded to two digits
		 *
		 * Once we hit less than 72 hours, don't display days anymore
		 *
		 * Once less than 1 minute is left, do not pad the second counter
		 * (counts down from 11 .. 10 .. 9 .. 0)
		 *
		 * In case of less than/no seconds left, display a "0".
		 */

		if (diff <= 0) {
			this.displayText = '0';
			return;
		}

		const secondsInMil = 1000;
		const minsInMil = secondsInMil * 60;
		const hoursInMil = minsInMil * 60;
		const daysInMil = hoursInMil * 24;

		const components = [] as string[];

		// Only include days if we have 72 or more hours left.
		let hours = Math.floor(diff / hoursInMil);
		if (hours >= 72) {
			const days = Math.floor(diff / daysInMil);
			const daysStr = days.toString(10).padStart(2, '0');
			components.push(daysStr);
			diff -= days * daysInMil;

			// Recount hours after days have been deducted.
			hours = Math.floor(diff / hoursInMil);
		}

		if (hours > 0) {
			const hoursStr = hours.toString(10).padStart(2, '0');
			components.push(hoursStr);
			diff -= hours * hoursInMil;
		}

		const mins = Math.floor(diff / minsInMil);
		if (mins > 0) {
			const minsStr = mins.toString(10).padStart(2, '0');
			components.push(minsStr);
			diff -= mins * minsInMil;
		}

		const seconds = Math.floor(diff / secondsInMil);
		// Only pad the seconds display if we have at least the minute display as well.
		if (components.length > 0) {
			const secondsStr = seconds.toString(10).padStart(2, '0');
			components.push(secondsStr);
		} else {
			const secondsStr = seconds.toString(10);
			components.push(secondsStr);
		}

		this.displayText = components.join(':');
	}
}
