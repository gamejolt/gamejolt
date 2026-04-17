<script lang="ts" setup>
import { AnchorHTMLAttributes, computed } from 'vue';

type Props = {
	targetSelf?: boolean;
	href: AnchorHTMLAttributes['href'];
};
const { targetSelf, href } = defineProps<Props>();

const target = computed(() => {
	if (targetSelf) {
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
