<script lang="ts" setup>
import AppBackdrop from './AppBackdrop.vue';
import { Backdrop, BackdropController } from './backdrop.service';

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
			v-for="(backdrop, index) of Backdrop.backdrops"
			:key="index"
			:to="getTargetForBackdrop(backdrop)"
		>
			<AppBackdrop :controller="backdrop" />
		</teleport>
	</div>
</template>
