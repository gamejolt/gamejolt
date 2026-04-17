<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';

const emit = defineEmits<{
	click: [e: Event];
}>();
</script>

<template>
	<p>
		<AppButton primary block @click="emit('click', $event)">
			<slot />
		</AppButton>
	</p>
</template>
