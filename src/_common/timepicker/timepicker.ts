import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import AppJolticon from '../../vue/components/jolticon/jolticon.vue'

@Component({
	components: {
		AppJolticon,
	},
})
export default class AppTimepicker extends Vue {
	@Prop(Date) value!: Date;
	@Prop({ type: Boolean, default: true })
	showMeridian!: boolean;
	@Prop(Array) meridians?: [string, string];
	@Prop(Boolean) readonlyInput!: boolean;

	hours = '';
	minutes = '';
	meridian = '';

	private get _meridians() {
		return this.meridians || [this.$gettext('AM'), this.$gettext('PM')];
	}

	created() {
		if (!this.value) {
			throw new Error('Value must be set');
		}
		this.onTimeValueChanged();
	}

	@Watch('value')
	@Watch('showMeridian')
	private onTimeValueChanged() {
		const hours = this.getValidHours(this.value.getHours()),
			minutes = this.getValidMinutes(this.value.getMinutes());
		this.hours = this.showMeridian && hours === 0 ? '12' : this.pad(hours);
		this.minutes = this.pad(minutes);
		this.meridian = this.value.getHours() < 12 ? this._meridians[0] : this._meridians[1];
	}

	getValidHours(hours: number) {
		if (hours < 0 || hours > 23) {
			return undefined;
		}

		if (this.showMeridian && hours >= 12) {
			hours -= 12;
		}
		return hours >= 0 && hours < 24 ? hours : undefined;
	}

	getValidMinutes(minutes: number) {
		return minutes >= 0 && minutes < 60 ? minutes : undefined;
	}

	updateHours() {
		if (this.readonlyInput) {
			return;
		}

		let hours = Math.round(Math.min(Math.max(parseInt(this.hours, 10), 0, 23)));
		if (isNaN(hours)) {
			hours = this.showMeridian ? 12 : 0;
			this.hours = this.pad(hours);
		}

		const newValue = new Date(this.value);
		if (this.showMeridian) {
			if (this.value.getHours() >= 12) {
				// If we're working with meridians and it's currently on 'PM' we need to add 12 hours.
				// This way for 1pm it'll submit hour 1 as hour 13 as the actual value.
				if (hours < 12) {
					hours += 12;
				} else {
					// Theres an issue when using hours >= 12 while in 'PM' if the result date is the same as the current one.
					// In that case it won't trigger the value watch to reformat the display hours correctly.
					// e.g. if the time is 1pm and we give it hour 13 it'll remain 13.
					// To fix this, we just modify this.hours directly to fix the display value.
					if (hours === this.value.getHours()) {
						this.hours = hours === 12 ? '12' : this.pad(hours - 12);
					}
				}
			} else if (hours === 12) {
				hours -= 12;
			}
		}
		newValue.setHours(hours);
		newValue.setDate(this.value.getDate());
		this.$emit('input', newValue);
	}

	updateMinutes() {
		if (this.readonlyInput) {
			return;
		}

		let minutes = Math.round(Math.min(Math.max(parseInt(this.minutes, 10), 0, 59)));
		if (isNaN(minutes)) {
			minutes = 0;
			this.minutes = this.pad(minutes);
		}

		const newValue = new Date(this.value);
		newValue.setMinutes(minutes);
		newValue.setDate(this.value.getDate());
		this.$emit('input', newValue);
	}

	addMinutes(minutes: number) {
		if (this.readonlyInput) {
			return;
		}

		const newValue = new Date(this.value.getTime() + minutes * 60000);
		newValue.setDate(this.value.getDate());
		this.$emit('input', newValue);
	}

	addHours(hours: number) {
		return this.addMinutes(hours * 60);
	}

	toggleMeridian() {
		this.addHours(12 * (this.value.getHours() < 12 ? 1 : -1));
	}

	private pad(value: any) {
		if (!value) {
			return '00';
		}

		return value.toString().length < 2 ? '0' + value : value + '';
	}
}
