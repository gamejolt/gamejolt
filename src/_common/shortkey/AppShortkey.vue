<script lang="ts" setup>
import { useShortkey } from '~common/shortkey/shortkey-service';

type Props = {
	shortkey: string;
};
const { shortkey } = defineProps<Props>();

const emit = defineEmits<{
	press: [e: KeyboardEvent];
}>();

useShortkey(shortkey, e => emit('press', e));
</script>

<template>
	<span />
</template>
