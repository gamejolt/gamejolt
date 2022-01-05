<script lang="ts" setup>
import { PropType } from 'vue';
import { Modal } from './modal.service';

defineProps({
	modal: {
		type: Object as PropType<Modal>,
		required: true,
	},
});
</script>

<template>
	<Component :is="modal.component" v-bind="modal.props" />
</template>
