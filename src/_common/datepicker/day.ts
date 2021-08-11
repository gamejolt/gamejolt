import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { arrayChunk } from '../../utils/array';
import { findRequiredVueParent } from '../../utils/vue';
import { date as dateFilter } from '../filters/date';
import AppDatepickerTS, { DatepickerDate } from './datepicker';
import AppDatepicker from './datepicker.vue';

@Options({})
export default class AppDatepickerDay extends Vue {
	@Prop(Date) modelValue!: Date;

	parent: AppDatepickerTS = null as any;

	@Emit('update:modelValue')
	emitUpdate(_modelValue: Date) {}

	@Emit('selected')
	emitSelected(_date: Date) {}

	get title() {
		return dateFilter(this.modelValue, this.parent.formatDayTitle);
	}

	get labels() {
		const days = this.getDays();
		const labels = [];

		for (let i = 0; i < 7; i++) {
			labels[i] = {
				abbr: dateFilter(days[i].date, this.parent.formatDayHeader),
				full: dateFilter(days[i].date, this.parent.formatDayName),
			};
		}

		return labels;
	}

	get rows() {
		return arrayChunk(this.getDays(), 7);
	}

	created() {
		this.parent = findRequiredVueParent(this, AppDatepicker) as AppDatepickerTS;
	}

	private getDays() {
		const year = this.modelValue.getFullYear(),
			month = this.modelValue.getMonth(),
			firstDayOfMonth = new Date(year, month, 1),
			firstDate = new Date(firstDayOfMonth);

		if (firstDayOfMonth.getDay() > 0) {
			firstDate.setDate(-firstDayOfMonth.getDay() + 1);
		}

		// 42 is the number of days on a six-month calendar
		const dates = this.getDates(firstDate, 42);
		const days = new Array<DatepickerDate>(42);
		for (let i = 0; i < 42; i++) {
			days[i] = this.parent.createDate(dates[i]);
		}
		return days;
	}

	private getDates(startDate: Date, n: number) {
		const dates = new Array<Date>(n),
			current = new Date(startDate);

		current.setHours(12); // Prevent repeated dates because of timezone bug
		for (let i = 0; i < n; i++) {
			dates[i] = new Date(current);
			current.setDate(current.getDate() + 1);
		}
		return dates;
	}

	move(direction: number) {
		const newValue = new Date(this.modelValue);
		newValue.setMonth(newValue.getMonth() + direction);
		this.emitUpdate(newValue);
	}

	select(date: Date) {
		const newValue = new Date(this.modelValue);
		newValue.setMonth(date.getMonth(), date.getDate());
		this.emitSelected(newValue);
	}
}
