<script lang="ts" setup>
import { computed, onMounted, ref, toRefs } from 'vue';
import AppExpand from '../../expand/AppExpand.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';

const props = defineProps({
	alertType: {
		type: String,
		required: true,
	},
	dismissKey: {
		type: String,
		default: null,
	},
	noMargin: {
		type: Boolean,
	},
	dismissTooltip: {
		type: String,
		default: undefined,
	},
});

const emit = defineEmits({
	dismiss: () => true,
});

const { dismissKey } = toRefs(props);

const StorageKeyPrefix = 'dismiss-alert:';
const shouldShow = ref(false);

const _key = computed(() => StorageKeyPrefix + dismissKey.value);

onMounted(() => {
	if (!dismissKey.value || !window.localStorage.getItem(_key.value)) {
		shouldShow.value = true;
	}
});

function dismiss() {
	if (dismissKey.value) {
		window.localStorage.setItem(_key.value, Date.now() + '');
	}
	shouldShow.value = false;

	emit('dismiss');
}
</script>

<template>
	<AppExpand :when="shouldShow">
		<div class="alert sans-margin-bottom" :class="`alert-${alertType}`">
			<a v-app-tooltip="dismissTooltip" class="alert-dismiss" @click="dismiss">
				<AppJolticon icon="remove" />
			</a>
			<div class="alert-content">
				<slot />
			</div>
		</div>
		<br v-if="!noMargin" />
	</AppExpand>
</template>
