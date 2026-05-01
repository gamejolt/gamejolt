<script lang="ts" setup>
import AppBackdrop from '~common/backdrop/AppBackdrop.vue';
import { BackdropController, useBackdropStore } from '~common/backdrop/backdrop.service';

const { backdrops } = useBackdropStore();

function getTargetForBackdrop(controller: BackdropController) {
	if (controller.context) {
		return controller.context;
	}
	return 'body';
}
</script>

<template>
	<div>
		<teleport
			v-for="(controller, index) of backdrops"
			:key="index"
			:to="getTargetForBackdrop(controller)"
		>
			<AppBackdrop :controller />
		</teleport>
	</div>
</template>
