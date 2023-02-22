<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue';

const props = defineProps({
	/**
	 * Resets our hover state when it changes. This can help fix some issues
	 * with the item rebuilding before it's able to reset the hover state.
	 */
	stateKey: {
		type: Number,
		default: undefined,
	},
	disable: {
		type: Boolean,
	},
});

const { stateKey, disable } = toRefs(props);
watch(
	() => stateKey?.value,
	() => {
		hovered.value = false;
	}
);

const hovered = ref(false);

const showHovered = computed(() => {
	return !disable.value && hovered.value;
});

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
	<slot :hovered="showHovered" :binding="binding" />
</template>
