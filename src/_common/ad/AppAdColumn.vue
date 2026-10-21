<script lang="ts" setup>
import { provide, toRef } from 'vue';

import { AdColumn, AdColumnKey } from '~common/ad/ad-column';

type Props = {
	column: AdColumn;
};

const { column } = defineProps<Props>();

provide(
	AdColumnKey,
	toRef(() => column)
);
</script>

<template>
	<slot />
</template>
