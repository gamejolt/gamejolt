<script lang="ts" setup>
import { computed, watch } from 'vue';

import AppDatepicker from '~common/datepicker/AppDatepicker.vue';
import AppTimepicker from '~common/timepicker/AppTimepicker.vue';

type Props = {
	value: number;
	timezoneOffset: number;
	minDate?: number;
	maxDate?: number;
};
const { value, timezoneOffset, minDate, maxDate } = defineProps<Props>();

const emit = defineEmits<{
	change: [date: number];
}>();

const _browserTimezoneOffset = new Date().getTimezoneOffset() * 60000;

const realTimezoneOffset = computed(() => timezoneOffset + _browserTimezoneOffset);
const datetime = computed(() => new Date(value + realTimezoneOffset.value));
const minDateBounds = computed(() =>
	minDate ? new Date(minDate + realTimezoneOffset.value) : undefined
);
const maxDateBounds = computed(() =>
	maxDate ? new Date(maxDate + realTimezoneOffset.value) : undefined
);

watch(() => timezoneOffset, _onTimezoneChanged);

function _onTimezoneChanged(newOffset: number, oldOffset: number) {
	emit('change', value - oldOffset + newOffset);
}

function select(date: Date) {
	// Get the selected date from the date/time pickers. This date would be
	// local to the timezone that was selected, so it must first be offsetted
	// back to UTC.
	emit('change', date.getTime() - realTimezoneOffset.value);
}
</script>

<template>
	<div class="datetime-picker">
		<AppDatepicker
			required
			:value="datetime"
			:min-date="minDateBounds"
			:max-date="maxDateBounds"
			@change="select($event)"
		/>

		<AppTimepicker :value="datetime" @change="select($event)" />
	</div>
</template>

<style lang="stylus" scoped>
.datetime-picker
	clearfix()

	:deep(.datepicker-table)
		float: left
		margin-right: ($grid-gutter-width / 2)

		@media $media-xs
			float: none
			margin-right: 0

	:deep(.timepicker)
		float: left

		@media $media-xs
			float: none
			margin-top: $line-height-computed
</style>
