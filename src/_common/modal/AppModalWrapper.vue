<script lang="ts" setup>
import { provide } from '@vue/runtime-core';
import { PropType } from 'vue';
import { Modal, ModalKey } from './modal.service';

const props = defineProps({
	modal: {
		type: Object as PropType<Modal>,
		required: true,
	},
});

provide(ModalKey, props.modal);
</script>

<template>
	<Component :is="modal.component" v-bind="{ modal, ...modal.props }" />
</template>
