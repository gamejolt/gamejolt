<script lang="ts" setup>
import { watch } from 'vue';

import { useScroller } from '../../../../_common/scroll/AppScrollScroller.vue';

type Props = {
	when?: boolean;
};
const { when } = defineProps<Props>();

const scrollParent = useScroller();

watch(() => when, () => scrollParent?.scrollTo(0));
</script>

<template>
	<div />
</template>
