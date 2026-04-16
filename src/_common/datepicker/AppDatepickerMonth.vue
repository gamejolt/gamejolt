<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { arrayChunk } from '../../utils/array';
import { formatDate } from '../filters/date';
import AppJolticon from '../jolticon/AppJolticon.vue';
import { DatepickerDate, DatepickerFormatMonthTitle, useDatepicker } from './AppDatepicker.vue';

const modelValue = defineModel<Date>({ required: true });

const { createDate, toggleMode } = useDatepicker();

const title = computed(() => formatDate(modelValue.value, DatepickerFormatMonthTitle));

const rows = computed(() => {
	const months = new Array<DatepickerDate>(12),
		year = modelValue.value.getFullYear();

	for (let i = 0; i < 12; i++) {
		months[i] = createDate(new Date(year, i, 1));
	}

	return arrayChunk(reactive(months), 3);
});

function move(direction: number) {
	const newValue = new Date(modelValue.value);
	newValue.setFullYear(newValue.getFullYear() + direction);
	modelValue.value = newValue;
}

function select(date: Date) {
	modelValue.value = date;
	toggleMode();
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
				<th>
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
		</thead>
		<tbody>
			<tr v-for="(row, i) of rows" :key="i">
				<td v-for="dt of row" :key="dt.date.getTime()" class="text-center">
					<button
						type="button"
						style="width: 100%"
						class="datepicker-btn datepicker-btn-default"
						:class="{
							'datepicker-btn-info': dt.isSelected,
							active: dt.isToday,
						}"
						:disabled="dt.isDisabled ? 'true' : undefined"
						@click="select(dt.date)"
					>
						<span :class="{ 'text-info': dt.isToday }">{{ dt.label }}</span>
					</button>
				</td>
			</tr>
		</tbody>
	</table>
</template>
