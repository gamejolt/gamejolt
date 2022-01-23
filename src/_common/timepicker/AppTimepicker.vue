<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue';
import { $gettext } from '../translate/translate.service';
import AppJolticon from '../jolticon/AppJolticon.vue';

const props = defineProps({
	value: {
		type: Date,
		required: true,
	},
});

const emit = defineEmits({
	change: (_date: Date) => true,
});

const { value: modelValue } = toRefs(props);
const hours = ref('');
const minutes = ref('');
const meridian = ref('');

const _meridians = computed(() => {
	return [$gettext('AM'), $gettext('PM')];
});

watch(modelValue, _onTimeValueChanged, { immediate: true });

function _onTimeValueChanged() {
	const newHours = getValidHours(modelValue.value.getHours()),
		newMinutes = getValidMinutes(modelValue.value.getMinutes());
	hours.value = newHours === 0 ? '12' : _pad(newHours);
	minutes.value = _pad(newMinutes);
	meridian.value = modelValue.value.getHours() < 12 ? _meridians.value[0] : _meridians.value[1];
}

function getValidHours(hours: number) {
	if (hours < 0 || hours > 23) {
		return undefined;
	}

	if (hours >= 12) {
		hours -= 12;
	}

	return hours >= 0 && hours < 24 ? hours : undefined;
}

function getValidMinutes(minutes: number) {
	return minutes >= 0 && minutes < 60 ? minutes : undefined;
}

function updateHours() {
	let newHours = Math.round(Math.min(Math.max(parseInt(hours.value, 10), 0, 23)));
	if (isNaN(newHours)) {
		newHours = 12;
		hours.value = _pad(newHours);
	}

	const newValue = new Date(modelValue.value);
	if (modelValue.value.getHours() >= 12) {
		// If we're working with meridians and it's currently on 'PM' we need to
		// add 12 hours. This way for 1pm it'll submit hour 1 as hour 13 as the
		// actual value.
		if (newHours < 12) {
			newHours += 12;
		} else {
			// Theres an issue when using hours >= 12 while in 'PM' if the
			// result date is the same as the current one. In that case it won't
			// trigger the value watch to reformat the display hours correctly.
			// e.g. if the time is 1pm and we give it hour 13 it'll remain 13.
			// To fix this, we just modify this.hours directly to fix the
			// display value.
			if (newHours === modelValue.value.getHours()) {
				hours.value = newHours === 12 ? '12' : _pad(newHours - 12);
			}
		}
	} else if (newHours === 12) {
		newHours -= 12;
	}
	newValue.setHours(newHours);
	newValue.setDate(modelValue.value.getDate());
	emit('change', newValue);
}

function updateMinutes() {
	let newMinutes = Math.round(Math.min(Math.max(parseInt(minutes.value, 10), 0, 59)));
	if (isNaN(newMinutes)) {
		newMinutes = 0;
		minutes.value = _pad(newMinutes);
	}

	const newValue = new Date(modelValue.value);
	newValue.setMinutes(newMinutes);
	newValue.setDate(modelValue.value.getDate());
	emit('change', newValue);
}

function addMinutes(minutes: number) {
	const newValue = new Date(modelValue.value.getTime() + minutes * 60000);
	newValue.setDate(modelValue.value.getDate());
	emit('change', newValue);
}

function addHours(hours: number) {
	return addMinutes(hours * 60);
}

function toggleMeridian() {
	addHours(12 * (modelValue.value.getHours() < 12 ? 1 : -1));
}

function _pad(value: any) {
	if (!value) {
		return '00';
	}

	return value.toString().length < 2 ? '0' + value : value + '';
}
</script>

<template>
	<table class="timepicker">
		<tbody>
			<tr class="text-center">
				<td>
					<a class="timepicker-link" @click="addHours(1)">
						<AppJolticon icon="chevron-up" big />
					</a>
				</td>
				<td>&nbsp;</td>
				<td>
					<a class="timepicker-link" @click="addMinutes(1)">
						<AppJolticon icon="chevron-up" big />
					</a>
				</td>
				<td />
			</tr>
			<tr>
				<td style="width: 50px" class="form-group">
					<input
						type="text"
						class="form-control text-center"
						:value="hours"
						:maxlength="2"
						@blur="updateHours()"
					/>
				</td>
				<td>:</td>
				<td style="width: 50px" class="form-group">
					<input
						type="text"
						class="form-control text-center"
						:value="minutes"
						:maxlength="2"
						@blur="updateMinutes()"
					/>
				</td>
				<td>
					<button
						type="button"
						class="timepicker-button text-center"
						@click.prevent="toggleMeridian()"
					>
						{{ meridian }}
					</button>
				</td>
			</tr>
			<tr class="text-center">
				<td>
					<a class="timepicker-link" @click="addHours(-1)">
						<AppJolticon icon="chevron-down" big />
					</a>
				</td>
				<td>&nbsp;</td>
				<td>
					<a class="timepicker-link" @click="addMinutes(-1)">
						<AppJolticon icon="chevron-down" big />
					</a>
				</td>
				<td />
			</tr>
		</tbody>
	</table>
</template>

<style lang="stylus" scoped>
.timepicker
	td
		padding-right: 5px

	.timepicker-link
		theme-prop('color', 'bg-subtle')
		user-select: none

		&:hover
			theme-prop('color', 'link-hover')

	/**
	 * The timepicker button -- for AM/PM.
	 */
	.timepicker-button
		change-bg('bg-offset')
		display: inline-block
		margin: 0
		text-align: center
		vertical-align: middle
		cursor: pointer
		background-image: none // Reset unusual Firefox-on-Android default style see https://github.com/necolas/normalize.css/issues/214
		border: 0
		white-space: nowrap
		user-select: none
		// Add some extra vertical padding because of the border that
		// goes into input elements.
		padding: ($padding-base-vertical + 1px) $padding-base-horizontal
		font-size: $font-size-base
		line-height: $line-height-base

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
			opacity: 0.65
			box-shadow: none

		&:hover
			change-bg('bg-subtle')
</style>
