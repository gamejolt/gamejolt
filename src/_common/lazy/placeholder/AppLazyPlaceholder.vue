<script lang="ts" setup>
import { h } from 'vue';

type Props = {
	when?: any;
	tag?: string;
};

const { when, tag = 'div' } = defineProps<Props>();
</script>

<template>
	<component
		:is="tag"
		:class="{
			'lazy-placeholder-resolving': !when,
			'lazy-placeholder-resolved': !!when,
		}"
	>
		<slot />
	</component>
</template>