<script lang="ts">
import { computed, inject, InjectionKey, markRaw, provide, Ref, ref, toRef } from 'vue';
import { formatDate } from '../filters/date';
import AppDatepickerDay from './AppDatepickerDay.vue';
import AppDatepickerMonth from './AppDatepickerMonth.vue';

type DateMode = 'day' | 'month';

export const DatepickerFormatDay = 'd';
export const DatepickerFormatMonth = 'LLLL';
export const DatepickerFormatDayHeader = 'iii';
export const DatepickerFormatDayName = 'iiii';
export const DatepickerFormatDayTitle = 'LLLL yyyy';
export const DatepickerFormatMonthTitle = 'yyyy';

type DatepickerController = ReturnType<typeof createDatepicker>;
export type DatepickerDate = ReturnType<DatepickerController['createDate']>;

const Key: InjectionKey<DatepickerController> = Symbol('datepicker');

export function useDatepicker() {
	return inject(Key)!;
}

function createDatepicker({
	modelValue,
	minDate,
	maxDate,
}: {
	modelValue: Ref<Date>;
	minDate: Ref<Date | null>;
	maxDate: Ref<Date | null>;
}) {
	const pickerMode = ref<DateMode>('day');
	const viewDate = ref(new Date(modelValue.value.getFullYear(), modelValue.value.getMonth()));

	function toggleMode() {
		if (pickerMode.value === 'day') {
			pickerMode.value = 'month';
		} else {
			pickerMode.value = 'day';
		}
	}

	function createDate(date: Date) {
		const label = formatDate(
			date,
			pickerMode.value === 'day' ? DatepickerFormatDay : DatepickerFormatMonth
		);
		const _now = new Date();

		const isSelected = computed(() => {
			return pickerMode.value === 'day'
				? !_compareDay(date, modelValue.value)
				: !_compareMonth(date, modelValue.value);
		});

		const isToday = computed(() =>
			pickerMode.value === 'day' ? !_compareDay(date, _now) : !_compareMonth(date, _now)
		);
		const isOtherMonth = computed(() => date.getMonth() !== viewDate.value.getMonth());

		const isDisabled = computed(() => {
			if (pickerMode.value === 'day') {
				return (
					(minDate.value && _compareDay(date, minDate.value) < 0) ||
					(maxDate.value && _compareDay(date, maxDate.value) > 0)
				);
			}

			return (
				(minDate.value && _compareMonth(date, minDate.value) < 0) ||
				(maxDate.value && _compareMonth(date, maxDate.value) > 0)
			);
		});

		function _compareMonth(date1: Date, date2: Date) {
			return (
				new Date(date1.getFullYear(), date1.getMonth()).getTime() -
				new Date(date2.getFullYear(), date2.getMonth()).getTime()
			);
		}

		function _compareDay(date1: Date, date2: Date) {
			return (
				new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime() -
				new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime()
			);
		}

		return {
			date: markRaw(date),
			label,
			isSelected,
			isToday,
			isOtherMonth,
			isDisabled,
		};
	}

	return {
		modelValue,
		minDate,
		maxDate,
		pickerMode,
		viewDate,

		toggleMode,
		createDate,
	};
}
</script>

<script lang="ts" setup>
const props = defineProps({
	value: {
		type: Date,
		required: true,
	},
	minDate: {
		type: Date,
		default: null,
	},
	maxDate: {
		type: Date,
		default: null,
	},
});

const emit = defineEmits({
	change: (_date: Date) => true,
});

const c = createDatepicker({
	modelValue: toRef(props, 'value'),
	minDate: toRef(props, 'minDate'),
	maxDate: toRef(props, 'maxDate'),
});
provide(Key, c);

const { pickerMode, viewDate } = c;

function select(date: Date) {
	const newValue = new Date(props.value);
	newValue.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
	emit('change', newValue);
}
</script>

<template>
	<div>
		<AppDatepickerDay v-if="pickerMode === 'day'" v-model="viewDate" @selected="select" />
		<AppDatepickerMonth v-if="pickerMode === 'month'" v-model="viewDate" />
	</div>
</template>

<!-- Global styling so that the inner children can use -->
<style lang="stylus">
datepicker-button-variant(color, background, hover-background)
	color: color
	background-color: background

	&:hover
	&:focus
	&:active
	&.active
		color: color
		background-color: hover-background

	&:active
	&.active
		background-image: none

	.badge
		color: background
		background-color: color

/**
 * The datepicker buttons.
 */
.datepicker-btn
	display: inline-block
	margin: 0
	text-align: center
	vertical-align: middle
	cursor: pointer
	background-image: none // Reset unusual Firefox-on-Android default style see https://github.com/necolas/normalize.css/issues/214
	border: 0
	white-space: nowrap
	user-select: none
	padding: 6px 12px
	font-size: $font-size-base
	line-height: $line-height-base

	// Less padding so it fits in the width for small displays.
	@media $media-xs
		padding-left: 10px
		padding-right: 10px

	&:hover
	&:focus
	&:active
		text-decoration: none
		outline: none

	&.disabled
	&[disabled]
	fieldset[disabled] &
		cursor: not-allowed
		pointer-events: none // Future-proof disabling of clicks
		opacity: 0.4
		box-shadow: none

	.jolticon
		cursor: pointer

	.text-info
		font-weight: bold
		color: inherit

	/**
	 * Button variants
	 */
	&.datepicker-btn-default
		datepicker-button-variant(inherit, var(--theme-bg-offset), var(--theme-bg-subtle))

	&.datepicker-btn-info
		datepicker-button-variant(var(--theme-highlight-fg), var(--theme-highlight), var(--theme-highlight))

	/**
	 * Block buttons.
	 */
	&.datepicker-btn-block
		display: block
		width: 100%
		padding-left: 0
		padding-right: 0

	.datepicker-btn-block + .datepicker-btn-block
		margin-top: 5px

	input[type='submit']
	input[type='reset']
	input[type='button']
		&.datepicker-btn-block
			width: 100%

.datepicker-table

	th
		padding: 1px

	td
		padding: 1px
</style>
