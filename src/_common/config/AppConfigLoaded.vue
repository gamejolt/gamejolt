<script lang="ts" setup>
import { ConfigService } from './config.service';

type Props = {
	tag?: string;
};
const { tag = 'div' } = defineProps<Props>();
</script>

<template>
	<component :is="tag">
		<slot v-if="ConfigService.isLoaded" />
	</component>
</template>
