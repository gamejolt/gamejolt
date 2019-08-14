import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { date as dateFilter } from '../../vue/filters/date';
import AppDatepickerDay from './day.vue';
import AppDatepickerMonth from './month.vue';

type DateMode = 'day' | 'month';

export class DatepickerDate {
	private picker: AppDatepicker;
	private now: Date;
	private mode: DateMode;

	readonly date: Date;
	readonly label: string;

	constructor(picker: AppDatepicker, date: Date) {
		this.picker = picker;
		this.now = new Date();
		this.mode = this.picker.pickerMode;
		this.date = date;
		this.label = dateFilter(
			this.date,
			this.mode === 'day' ? this.picker.formatDay : this.picker.formatMonth
		);
	}

	get isSelected() {
		return this.mode === 'day'
			? !this.compareDay(this.date, this.picker.value)
			: !this.compareMonth(this.date, this.picker.value);
	}

	get isToday() {
		return this.mode === 'day'
			? !this.compareDay(this.date, this.now)
			: !this.compareMonth(this.date, this.now);
	}

	get isOtherMonth() {
		return this.date.getMonth() !== this.picker.viewDate.getMonth();
	}

	get isDisabled() {
		if (this.mode === 'day') {
			return (
				(this.picker.minDate && this.compareDay(this.date, this.picker.minDate) < 0) ||
				(this.picker.maxDate && this.compareDay(this.date, this.picker.maxDate) > 0)
			);
		}

		return (
			(this.picker.minDate && this.compareMonth(this.date, this.picker.minDate) < 0) ||
			(this.picker.maxDate && this.compareMonth(this.date, this.picker.maxDate) > 0)
		);
	}

	private compareMonth(date1: Date, date2: Date) {
		return (
			new Date(date1.getFullYear(), date1.getMonth()).getTime() -
			new Date(date2.getFullYear(), date2.getMonth()).getTime()
		);
	}

	private compareDay(date1: Date, date2: Date) {
		return (
			new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime() -
			new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime()
		);
	}
}

@Component({
	components: {
		AppDatepickerDay,
		AppDatepickerMonth,
	},
})
export default class AppDatepicker extends Vue {
	@Prop(Date) value!: Date;
	@Prop({ type: Date, default: null })
	minDate!: Date | null;
	@Prop({ type: Date, default: null })
	maxDate!: Date | null;

	pickerMode: DateMode = 'day';
	viewDate: Date = null as any;

	readonly formatDay = 'D';
	readonly formatMonth = 'MMMM';
	readonly formatDayHeader = 'ddd';
	readonly formatDayName = 'dddd';
	readonly formatDayTitle = 'MMMM YYYY';
	readonly formatMonthTitle = 'YYYY';

	created() {
		this.viewDate = new Date(this.value.getFullYear(), this.value.getMonth());
	}

	createDate(date: Date) {
		return new DatepickerDate(this, date);
	}

	toggleMode() {
		if (this.pickerMode === 'day') {
			this.pickerMode = 'month';
		} else {
			this.pickerMode = 'day';
		}
	}

	select(date: Date) {
		const newValue = new Date(this.value);
		newValue.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
		this.$emit('input', newValue);
	}
}
