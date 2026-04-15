<script lang="ts" setup>
import { PropType } from 'vue';

import { Growl } from './growls.service';

defineProps({
	growl: {
		type: Object as PropType<Growl>,
		required: true,
	},
});

const emit = defineEmits<{
	close: [];
}>();
</script>

<template>
	<component :is="growl.component" v-bind="growl.props" @close="emit('close')" />
</template>
