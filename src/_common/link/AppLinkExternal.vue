<script lang="ts" setup>
import { AnchorHTMLAttributes, PropType, computed } from 'vue';

const props = defineProps({
	targetSelf: {
		type: Boolean,
	},
	href: {
		type: String as PropType<AnchorHTMLAttributes['href']>,
		required: true,
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
	<a rel="nofollow noopener" :target="target" :href="href">
		<slot />
	</a>
</template>
