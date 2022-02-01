<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
	targetSelf: {
		type: Boolean,
	},
});

const target = computed(() => {
	if (props.targetSelf) {
		return '_self';
	}
	return '_blank';
});
</script>

<template>
	<a rel="nofollow noopener" :target="target">
		<slot />
	</a>
</template>
