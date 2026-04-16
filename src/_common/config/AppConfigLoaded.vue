<script lang="ts" setup>
import { ConfigService } from '~common/config/config.service';

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
