<script lang="ts" setup>
import { toRefs, watch } from 'vue';
import { useScroller } from '../../../../_common/scroll/AppScrollScroller.vue';

const props = defineProps({
	when: {
		type: Boolean,
	},
});

const { when } = toRefs(props);

const scrollParent = useScroller();

watch(when, () => scrollParent?.scrollTo(0));
</script>

<template>
	<div />
</template>
