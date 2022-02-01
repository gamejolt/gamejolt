<script lang="ts" setup>
import { computed, reactive, toRefs } from 'vue';
import { arrayChunk } from '../../utils/array';
import { formatDate } from '../filters/date';
import {
	DatepickerDate,
	DatepickerFormatDayHeader,
	DatepickerFormatDayName,
	DatepickerFormatDayTitle,
	useDatepicker,
} from './AppDatepicker.vue';

const props = defineProps({
	modelValue: {
		type: Date,
		required: true,
	},
});

const emit = defineEmits({
	'update:modelValue': (_modelValue: Date) => true,
	selected: (_date: Date) => true,
});

const { modelValue } = toRefs(props);
const { createDate, toggleMode } = useDatepicker();

const title = computed(() => formatDate(modelValue.value, DatepickerFormatDayTitle));
const rows = computed(() => arrayChunk(reactive(_getDays()), 7));

const labels = computed(() => {
	const days = _getDays();
	const labels = [];

	for (let i = 0; i < 7; i++) {
		labels[i] = {
			abbr: formatDate(days[i].date, DatepickerFormatDayHeader),
			full: formatDate(days[i].date, DatepickerFormatDayName),
		};
	}

	return labels;
});

function _getDays() {
	const year = modelValue.value.getFullYear(),
		month = modelValue.value.getMonth(),
		firstDayOfMonth = new Date(year, month, 1),
		firstDate = new Date(firstDayOfMonth);

	if (firstDayOfMonth.getDay() > 0) {
		firstDate.setDate(-firstDayOfMonth.getDay() + 1);
	}

	// 42 is the number of days on a six-month calendar
	const dates = _getDates(firstDate, 42);
	const days = new Array<DatepickerDate>(42);
	for (let i = 0; i < 42; i++) {
		days[i] = createDate(dates[i]);
	}
	return days;
}

function _getDates(startDate: Date, n: number) {
	const dates = new Array<Date>(n),
		current = new Date(startDate);

	current.setHours(12); // Prevent repeated dates because of timezone bug
	for (let i = 0; i < n; i++) {
		dates[i] = new Date(current);
		current.setDate(current.getDate() + 1);
	}
	return dates;
}

function move(direction: number) {
	const newValue = new Date(modelValue.value);
	newValue.setMonth(newValue.getMonth() + direction);
	emit('update:modelValue', newValue);
}

function select(date: Date) {
	const newValue = new Date(modelValue.value);
	newValue.setMonth(date.getMonth(), date.getDate());
	emit('selected', newValue);
}
</script>

<template>
	<table class="datepicker-table">
		<thead>
			<tr>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default pull-left"
						style="width: 100%"
						@click="move(-1)"
					>
						<AppJolticon icon="chevron-left" />
					</button>
				</th>
				<th colspan="5">
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default"
						style="width: 100%"
						@click="toggleMode()"
					>
						<strong>{{ title }}</strong>
					</button>
				</th>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default pull-right"
						style="width: 100%"
						@click="move(1)"
					>
						<AppJolticon icon="chevron-right" />
					</button>
				</th>
			</tr>
			<tr>
				<th v-for="label of labels" :key="label.abbr" class="text-center">
					<small>{{ label.abbr }}</small>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(row, i) of rows" :key="i">
				<td v-for="(dt, n) of row" :key="n" class="text-center">
					<a
						style="width: 100%"
						class="datepicker-btn datepicker-btn-default"
						:class="{
							'datepicker-btn-info': dt.isSelected,
							active: dt.isToday,
						}"
						:disabled="dt.isDisabled ? 'true' : undefined"
						@click="select(dt.date)"
					>
						<span
							:class="{
								'text-muted': dt.isOtherMonth,
								'text-info': dt.isToday,
							}"
						>
							{{ dt.label }}
						</span>
					</a>
				</td>
			</tr>
		</tbody>
	</table>
</template>
