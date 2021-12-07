import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive } from 'vue-property-decorator';
import { ContentEditorController, ContentEditorControllerKey } from '../content-editor-controller';

@Component({})
export default class AppContentEditorInsetControls extends Vue {
	@InjectReactive(ContentEditorControllerKey)
	controller!: ContentEditorController;

	private oldTop = 0;
	$refs!: {
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
