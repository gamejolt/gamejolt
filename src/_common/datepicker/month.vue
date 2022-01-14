<script lang="ts">
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
						<app-jolticon icon="chevron-left" />
					</button>
				</th>
				<th>
					<button
						type="button"
						class="datepicker-btn datepicker-btn-default"
						style="width: 100%"
						@click="parent.toggleMode()"
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
						<app-jolticon icon="chevron-right" />
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
						:disabled="dt.isDisabled"
						@click="select(dt.date)"
					>
						<span :class="{ 'text-info': dt.isToday }">{{ dt.label }}</span>
					</button>
				</td>
			</tr>
		</tbody>
	</table>
</template>
