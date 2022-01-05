<script lang="ts" setup>
import { computed } from 'vue';
import { Backdrop, BackdropController } from './backdrop.service';
import AppBackdrop from './backdrop.vue';

const backdrops = computed(() => Backdrop.backdrops);

function getTargetForBackdrop(backdrop: BackdropController) {
	if (backdrop.context) {
		return backdrop.context;
	}
	return 'body';
}
</script>

<template>
	<div>
		<teleport
			v-for="(backdrop, index) of backdrops"
			:key="index"
			:to="getTargetForBackdrop(backdrop)"
		>
			<AppBackdrop :controller="backdrop" />
		</teleport>
	</div>
</template>
