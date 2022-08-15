<script lang="ts" setup>
import { PropType } from 'vue';
import { FiresideController, provideFiresideController } from './controller/controller';

const props = defineProps({
	controller: {
		type: Object as PropType<FiresideController>,
		required: true,
	},
});

// We don't want to allow to change the provided controller.
// eslint-disable-next-line vue/no-setup-props-destructure
const { controller } = props;

provideFiresideController(controller);
</script>

<template>
	<slot />
</template>
