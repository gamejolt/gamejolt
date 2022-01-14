<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { ContentEditorController, ContentEditorControllerKey } from '../content-editor-controller';

@Options({})
export default class AppContentEditorInsetControls extends Vue {
	@Inject({ from: ContentEditorControllerKey })
	controller!: ContentEditorController;

	private oldTop = 0;

	declare $refs: {
		container: HTMLDivElement;
	};

	get shouldShow() {
		return !!this.view && !this.isOverflowing;
	}

	get view() {
		return this.controller.view;
	}

	get isOverflowing() {
		return this.top <= -8 || this.controller.window.height - this.top <= 12;
	}

	get top() {
		const {
			scope: { cursorStartHeight, isFocused },
			relativeCursorTop,
		} = this.controller;

		// Helps to smooth animations when focus changes.
		if (!isFocused) {
			return this.oldTop;
		}

		this.oldTop = relativeCursorTop - cursorStartHeight / 2;
		return this.oldTop;
	}
}
</script>

<template>
	<div ref="container" class="inset-controls-container" :style="{ top: top + 'px' }">
		<slot v-if="shouldShow" />
	</div>
</template>

<style lang="stylus" scoped>
.inset-controls-container
	position: absolute
	display: flex
	align-items: center
	// Offset for the '.form-control' padding
	right: $padding-base-horizontal

	& ::v-deep(.inset-container-controls)
		display: block
		margin-left: 8px
</style>
