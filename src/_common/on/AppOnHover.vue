<script lang="ts" setup>
import { ref } from 'vue';

const hovered = ref(false);

/**
 * This should be bound to the slot components that want to affect the hover
 * state.
 */
const binding = {
	onMouseenter,
	onMouseleave,
};

function onMouseenter() {
	hovered.value = true;
}

function onMouseleave() {
	hovered.value = false;
}
</script>

<template>
	<slot :hovered="hovered" :binding="binding" />
</template>
