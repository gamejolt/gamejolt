<script lang="ts" setup>
import AppButton from '../../../../../_common/button/AppButton.vue';

const emit = defineEmits({
	click: (_e: Event) => true,
});
</script>

<template>
	<p>
		<AppButton primary block @click="emit('click', $event)">
			<slot />
		</AppButton>
	</p>
</template>
