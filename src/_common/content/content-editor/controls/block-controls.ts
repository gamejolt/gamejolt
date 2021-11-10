import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Growls } from '../../../growls/growls.service';
import { Screen } from '../../../screen/screen-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	editorInsertBlockquote,
	editorInsertBulletList,
	editorInsertCodeBlock,
	editorInsertEmbed,
	editorInsertHr,
	editorInsertNumberedList,
	editorInsertSpoiler,
	editorUploadImageFile,
} from '../content-editor-controller';

@Component({
	components: {},
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorBlockControls extends Vue {
	@Prop(propRequired(Boolean)) collapsed!: boolean;

	@InjectReactive(ContentEditorControllerKey)
	controller!: ContentEditorController;

	private oldTop = 0;

	readonly Screen = Screen;

	@Emit('collapsed-change') emitCollapsedChange(_isCollapsed: boolean) {}

	$refs!: {
		container: HTMLElement;
	};

	get contextCapabilities() {
		return this.controller.contextCapabilities;
	}

	get view() {
		return this.controller.view!;
	}

	get shouldShow() {
		return this.visible && this.top >= -24 && !this.isOverflowingBottom;
	}

	get isOverflowingBottom() {
		return this.controller.window.height - this.top < 24;
	}

	get visible() {
		if (!this.controller.scope.isFocused || this.controller.scope.hasSelection) {
			return false;
		}

		return this.controller.capabilities.hasBlockControls;
	}

	get top() {
		// Use the previous value if our new scope doesn't allow block controls.
		if (!this.visible) {
			return this.oldTop;
		}

		const {
			scope: { cursorStartHeight },
			relativeCursorTop,
		} = this.controller;

		// AppButton line-height is ~36px by default
		const buttonHeight = 36;

		const heightDiff = buttonHeight - cursorStartHeight;
		this.oldTop = relativeCursorTop - heightDiff / 2;
		return this.oldTop;
	}

	onClickExpand() {
		this.emitCollapsedChange(!this.collapsed);
	}

	onClickMedia() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.png,.jpg,.jpeg,.gif,.webp';
		input.multiple = true;

		input.onchange = e => {
			if (e.target instanceof HTMLInputElement) {
				const files = e.target.files;
				if (files !== null) {
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						const result = editorUploadImageFile(this.controller, file);
						if (!result) {
							Growls.error({
								title: this.$gettext('Invalid file selected'),
								message: this.$gettextInterpolate(
									'"%{ filename }" is not a valid image file.',
									{ filename: file.name }
								),
							});
						}
					}
				}
			}
		};

		input.click();
	}

	onClickEmbed() {
		this.emitCollapsedChange(true);
		editorInsertEmbed(this.controller);
	}

	onClickCodeBlock() {
		this.emitCollapsedChange(true);
		editorInsertCodeBlock(this.controller);
	}

	onClickBlockquote() {
		this.emitCollapsedChange(true);
		editorInsertBlockquote(this.controller);
	}

	onClickHr() {
		this.emitCollapsedChange(true);
		editorInsertHr(this.controller);
	}

	onClickSpoiler() {
		this.emitCollapsedChange(true);
		editorInsertSpoiler(this.controller);
	}

	onClickBulletList() {
		this.emitCollapsedChange(true);
		editorInsertBulletList(this.controller);
	}

	onClickOrderedList() {
		this.emitCollapsedChange(true);
		editorInsertNumberedList(this.controller);
	}
}
