<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

type Props = {
	tag: string;
};
const { tag } = defineProps<Props>();

const url = computed(() => {
	const searchTerm = encodeURIComponent(`#${tag}`);
	return `/search?q=${searchTerm}`;
});
</script>

<template>
	<RouterLink :to="url">
		<slot />
	</RouterLink>
</template>
