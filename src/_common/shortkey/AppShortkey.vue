<script lang="ts" setup>
import { useShortkey } from './shortkey-service';

const props = defineProps({
	shortkey: {
		type: String,
		required: true,
	},
});

const emit = defineEmits<{
	press: [e: KeyboardEvent];
}>();

useShortkey(props.shortkey, e => emit('press', e));
</script>

<template>
	<span />
</template>
