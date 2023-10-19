<script lang="ts" setup>
import { determine } from 'jstimezonedetect';
import { computed, onMounted, ref, toRefs } from 'vue';
import { formatDate } from '../../../../../_common/filters/date';
import { Timezone, TimezoneData } from '../../../../../_common/timezone/timezone.service';

const props = defineProps({
	date: {
		type: Number,
		required: true,
	},
	timezone: {
		type: String,
		required: true,
	},
});

const { date, timezone } = toRefs(props);

// TODO(component-setup-refactor): check the ref type
const timezones = ref<{ [region: string]: (TimezoneData & { label?: string })[] }>(null as any);

// date is UTC, add the set offset, and remove the local timezone offset.
// This displays the time with the passed in timezone.
const offsetDate = computed(() => {
	return date.value + offset.value - localOffset.value;
});

const localOffset = computed(() => {
	if (!timezone?.value || !timezones.value) {
		return 0;
	}

	return _getOffset(determine().name());
});

const offset = computed(() => {
	if (!timezone?.value || !timezones.value) {
		return 0;
	}

	return _getOffset(timezone.value);
});

onMounted(async () => {
	timezones.value = await Timezone.getGroupedTimezones();
});

function _getOffset(timezone: string) {
	const tz = _timezoneByName(timezone);
	if (!tz) {
		console.warn('Could not find timezone offset for: ' + tz);
		return 0;
	} else {
		return tz.o * 1000;
	}
}

function _timezoneByName(timezone: string) {
	for (const region in timezones.value) {
		const tz = timezones.value[region].find(_tz => _tz.i === timezone);
		if (tz) {
			return tz;
		}
	}
	return null;
}
</script>

<template>
	<div>
		{{ formatDate(offsetDate, 'mediumDate') }}
		{{ formatDate(offsetDate, 'shortTime') }}
	</div>
</template>
