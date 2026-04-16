<script lang="ts" setup>
import { provide } from 'vue';

import { Modal, ModalKey } from './modal.service';

type Props = {
	modal: Modal;
};
const { modal } = defineProps<Props>();

provide(ModalKey, modal);
</script>

<template>
	<component :is="modal.component" v-bind="modal.props" />
</template>
