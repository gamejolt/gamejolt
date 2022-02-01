<script lang="ts" setup>
import { computed, toRefs, watch } from 'vue';
import AppDatepicker from '../datepicker/AppDatepicker.vue';
import AppTimepicker from '../timepicker/AppTimepicker.vue';

const props = defineProps({
	value: {
		type: Number,
		required: true,
	},
	timezoneOffset: {
		type: Number,
		required: true,
	},
	minDate: {
		type: Number,
		default: undefined,
	},
	maxDate: {
		type: Number,
		default: undefined,
	},
});

const emit = defineEmits({
	change: (_date: number) => true,
});

const { value: modelValue, timezoneOffset, minDate, maxDate } = toRefs(props);

const _browserTimezoneOffset = new Date().getTimezoneOffset() * 60000;

const realTimezoneOffset = computed(() => timezoneOffset.value + _browserTimezoneOffset);
const datetime = computed(() => new Date(modelValue.value + realTimezoneOffset.value));
const minDateBounds = computed(() =>
	minDate?.value ? new Date(minDate.value + realTimezoneOffset.value) : undefined
);
const maxDateBounds = computed(() =>
	maxDate?.value ? new Date(maxDate.value + realTimezoneOffset.value) : undefined
);

watch(timezoneOffset, _onTimezoneChanged);

function _onTimezoneChanged(newOffset: number, oldOffset: number) {
	emit('change', modelValue.value - oldOffset + newOffset);
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

	::v-deep(.datepicker-table)
		float: left
		margin-right: ($grid-gutter-width / 2)

		@media $media-xs
			float: none
			margin-right: 0

	::v-deep(.timepicker)
		float: left

		@media $media-xs
			float: none
			margin-top: $line-height-computed
</style>
