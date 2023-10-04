<script lang="ts" setup>
import { computed } from 'vue';
import AppJolticon from '../../../../jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
import { editorInsertGif, useContentEditorController } from '../../content-editor-controller';
import { showContentEditorGifModal } from '../../modals/gif/gif-modal.service';

const controller = useContentEditorController()!;
const visible = computed(() => controller.scope.isFocused && controller.capabilities.gif);

async function openGifModal() {
	const gif = await showContentEditorGifModal();
	if (gif === undefined) {
		return;
	}

	editorInsertGif(controller, gif);
}
</script>

<template>
	<transition name="fade">
		<AppJolticon
			v-if="visible"
			v-app-tooltip="$gettext('Insert Gif')"
			class="gif-button inset-container-controls"
			icon="gif"
			@click.prevent="openGifModal"
		/>
	</transition>
</template>

<style lang="stylus" scoped>
.gif-button
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
