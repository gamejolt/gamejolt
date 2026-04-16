<script lang="ts" setup>
import { toRef } from 'vue';

import { useOnHover } from './useOnHover';

type Props = {
	/**
	 * Resets our hover state when it changes. This can help fix some issues
	 * with the item rebuilding before it's able to reset the hover state.
	 */
	stateKey?: number;
	disable?: boolean;
};
const { stateKey, disable } = defineProps<Props>();

const { hoverBinding, hovered } = useOnHover({
	stateKey: toRef(() => stateKey),
	disable: toRef(() => disable),
});
</script>

<template>
	<slot :hovered="hovered" :hover-binding="hoverBinding" />
</template>
