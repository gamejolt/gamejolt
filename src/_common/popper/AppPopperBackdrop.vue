<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue';

import { BackdropController, useBackdropStore } from '~common/backdrop/backdrop.service';

const { push: pushBackdrop } = useBackdropStore();

let controller: BackdropController | undefined;

onMounted(() => {
	if (!controller) {
		controller = pushBackdrop({ className: 'popper-backdrop' }) ?? undefined;
	}
});

onBeforeUnmount(() => {
	if (controller) {
		controller.remove();
		controller = undefined;
	}
});
</script>

<template>
	<slot />
</template>
