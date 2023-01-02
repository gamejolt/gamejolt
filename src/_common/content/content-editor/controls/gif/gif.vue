<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
import { editorInsertGif, useContentEditorController } from '../../content-editor-controller';
import { ContentEditorGifModal } from '../../modals/gif/gif-modal.service';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppContentEditorControlsGif extends Vue {
	controller = setup(() => useContentEditorController()!);

	get view() {
		return this.controller.view!;
	}

	get visible() {
		return this.controller.scope.isFocused && this.controller.capabilities.gif;
	}

	async openGifModal() {
		const gif = await ContentEditorGifModal.show();
		if (gif === undefined) {
			return;
		}

		editorInsertGif(this.controller, gif);
	}
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
