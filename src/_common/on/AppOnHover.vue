<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue';

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
const hovered = ref(false);

// Skip if they didn't define a stateKey at all.
// eslint-disable-next-line vue/no-ref-as-operand
if (stateKey) {
	watch(
		() => stateKey?.value,
		() => {
			hovered.value = false;
		}
	);
}

/**
 * This should be bound to the slot components that want to affect the hover
 * state.
 */
const binding = {
	onMouseenter() {
		hovered.value = true;
	},
	onMouseleave() {
		hovered.value = false;
	},
};
</script>

<template>
	<slot :hovered="!disable && hovered" :binding="binding" />
</template>
