<script lang="ts" setup>
import { useEscapeStack } from '../escape-stack/escape-stack.service';

/**
 * Done in its own component for performance reasons, so it only has to execute
 * this code when showing.
 */

const emit = defineEmits({
	trigger: () => true,
});

useEscapeStack(() => emit('trigger'));
</script>

<template>
	<slot />
</template>
