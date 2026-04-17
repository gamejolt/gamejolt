<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import AppExpand from '~common/expand/AppExpand.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';

type Props = {
	alertType: string;
	dismissKey?: string | null;
	noMargin?: boolean;
	dismissTooltip?: string;
};
const { dismissKey = null } = defineProps<Props>();

const emit = defineEmits<{
	dismiss: [];
}>();

const StorageKeyPrefix = 'dismiss-alert:';
const shouldShow = ref(false);

const _key = computed(() => StorageKeyPrefix + dismissKey);

onMounted(() => {
	if (!dismissKey || !window.localStorage.getItem(_key.value)) {
		shouldShow.value = true;
	}
});

function dismiss() {
	if (dismissKey) {
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
