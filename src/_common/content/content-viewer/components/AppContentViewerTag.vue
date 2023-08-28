<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
	tag: {
		type: String,
		required: true,
	},
});

const { tag } = toRefs(props);

const url = computed(() => {
	const searchTerm = encodeURIComponent(`#${tag.value}`);
	return `/search?q=${searchTerm}`;
});
</script>

<template>
	<RouterLink :to="url">
		<slot />
	</RouterLink>
</template>
