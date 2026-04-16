<script lang="ts" setup>
import { Growl } from './growls.service';

type Props = {
	growl: Growl;
};
defineProps<Props>();

const emit = defineEmits<{
	close: [];
}>();
</script>

<template>
	<component :is="growl.component" v-bind="growl.props" @close="emit('close')" />
</template>
