<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { Backdrop, BackdropController } from '../backdrop/backdrop.service';

let backdrop: BackdropController | undefined;

onMounted(() => {
	if (!backdrop) {
		backdrop = Backdrop.push({ className: 'popper-backdrop' });
	}
});

onBeforeUnmount(() => {
	if (backdrop) {
		backdrop.remove();
		backdrop = undefined;
	}
});
</script>

<template>
	<slot />
</template>
