import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { arrayChunk } from '../../utils/array';
import { findRequiredVueParent } from '../../utils/vue';
import { formatDate } from '../filters/date';
import AppDatepickerTS, { DatepickerDate } from './datepicker';
import AppDatepicker from './datepicker.vue';

@Options({})
export default class AppDatepickerMonth extends Vue {
	@Prop({ type: Date, required: true })
	modelValue!: Date;

	parent: AppDatepickerTS = null as any;

	@Emit('update:modelValue')
	emitUpdate(_date: Date) {}

	get title() {
		return formatDate(this.modelValue, this.parent.formatMonthTitle);
	}

	get rows() {
		const months = new Array<DatepickerDate>(12),
			year = this.modelValue.getFullYear();

		for (let i = 0; i < 12; i++) {
			months[i] = this.parent.createDate(new Date(year, i, 1));
		}

		return arrayChunk(months, 3);
	}

	created() {
		this.parent = findRequiredVueParent(this, AppDatepicker) as AppDatepickerTS;
	}

	move(direction: number) {
		const newValue = new Date(this.modelValue);
		newValue.setFullYear(newValue.getFullYear() + direction);
		this.emitUpdate(newValue);
	}

	select(date: Date) {
		this.emitUpdate(date);
		this.parent.toggleMode();
	}
}
