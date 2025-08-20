<script lang="ts" setup>
import { computed } from 'vue';
import AppJolticon from '../../../../jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
import {
	editorInsertCustomButton,
	useContentEditorController,
} from '../../content-editor-controller';
import { showContentEditorCustomButtonModal } from '../../modals/custom-button/custom-button-modal.service.js';

const controller = useContentEditorController()!;
const visible = computed(() => controller.scope.isFocused && controller.capabilities.gif);

async function openCustomButtonModal() {
	const customButton = await showContentEditorCustomButtonModal('');
	console.log('Adding custom button to document', customButton);
	if (customButton === undefined) {
		return;
	}

	editorInsertCustomButton(controller, customButton);
}
</script>

<template>
	<transition name="fade">
		<AppJolticon
			v-if="visible"
			v-app-tooltip="$gettext('Insert Custom Button')"
			class="custom-button inset-container-controls"
			icon="sparkles"
			@click.prevent="openCustomButtonModal"
		/>
	</transition>
</template>

<style lang="stylus" scoped>
.custom-button
	font-size: 20px
	transition: filter 0.15s, transform 0.2s ease
	cursor: pointer

	&:not(:hover)
		filter: grayscale(1) opacity(75%)

	&:hover
		transform: scale(1.2)

	&:focus
		outline: none
</style>
