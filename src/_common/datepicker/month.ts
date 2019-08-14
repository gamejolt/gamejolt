import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { arrayChunk } from '../../utils/array';
import { findRequiredVueParent } from '../../utils/vue';
import AppJolticon from '../../vue/components/jolticon/jolticon.vue';
import { date as dateFilter } from '../../vue/filters/date';
import AppDatepickerTS, { DatepickerDate } from './datepicker';
import AppDatepicker from './datepicker.vue';

@Component({
	components: {
		AppJolticon,
	},
})
export default class AppDatepickerMonth extends Vue {
	@Prop(Date) value!: Date;

	parent: AppDatepickerTS = null as any;

	get title() {
		return dateFilter(this.value, this.parent.formatMonthTitle);
	}

	get rows() {
		const months = new Array<DatepickerDate>(12),
			year = this.value.getFullYear();

		for (let i = 0; i < 12; i++) {
			months[i] = this.parent.createDate(new Date(year, i, 1));
		}

		return arrayChunk(months, 3);
	}

	created() {
		this.parent = findRequiredVueParent(this, AppDatepicker) as AppDatepickerTS;
	}

	move(direction: number) {
		const newValue = new Date(this.value);
		newValue.setFullYear(newValue.getFullYear() + direction);
		this.$emit('input', newValue);
	}

	select(date: Date) {
		this.$emit('input', date);
		this.parent.toggleMode();
	}
}
