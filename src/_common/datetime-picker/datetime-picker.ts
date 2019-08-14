import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import AppDatepicker from '../datepicker/datepicker.vue';
import AppTimepicker from '../timepicker/timepicker.vue';

@Component({
	components: {
		AppDatepicker,
		AppTimepicker,
	},
})
export default class AppDatetimePicker extends Vue {
	@Prop(Number) value!: number;
	@Prop(Number) timezoneOffset!: number;
	@Prop(Number) minDate?: number;
	@Prop(Number) maxDate?: number;

	private myTimezoneOffset = new Date().getTimezoneOffset() * 60000;

	get tzOffset() {
		return this.timezoneOffset + this.myTimezoneOffset;
	}

	get datetime() {
		return new Date(this.value + this.tzOffset);
	}

	get minDateBounds() {
		return this.minDate ? new Date(this.minDate + this.tzOffset) : null;
	}

	get maxDateBounds() {
		return this.maxDate ? new Date(this.maxDate + this.tzOffset) : null;
	}

	created() {
		if (!this.value) {
			throw new Error('Value must be initialized');
		}
	}

	@Watch('timezoneOffset')
	onTimezoneChanged(oldOffset: number, newOffset: number) {
		this.$emit('input', this.value - oldOffset + newOffset);
	}

	select(date: Date) {
		// Get the selected date from the date/time pickers.
		// This date would be local to the timezone that was selected,
		// so it must first be offsetted back to UTC.
		this.$emit('input', date.getTime() - this.tzOffset);
	}
}
