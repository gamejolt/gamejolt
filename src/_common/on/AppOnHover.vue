<script lang="ts" setup>
import { toRefs } from 'vue';
import { useOnHover } from './useOnHover';

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
const { hoverBinding, hovered } = useOnHover({ stateKey, disable });
</script>

<template>
	<slot :hovered="hovered" :hover-binding="hoverBinding" />
</template>
