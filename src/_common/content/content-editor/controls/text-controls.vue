<script lang="ts">
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Vue, Watch } from 'vue-property-decorator';
import { Screen } from '../../../screen/screen-service';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import {
	editorGetSelectedText,
	editorLink,
	editorToggleHeading,
	editorToggleMark,
	editorUnlink,
	useContentEditorController,
} from '../content-editor-controller';
import { ContentEditorLinkModal } from '../modals/link/link-modal.service';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppContentEditorTextControls extends Vue {
	controller = setup(() => useContentEditorController()!);

	private containerWidth = 100;
	private oldLeft = '0px';
	private oldBottom = '0px';

	readonly Screen = Screen;

	declare $refs: {
		container: HTMLElement;
	};

	get contextCapabilities() {
		return this.controller.contextCapabilities;
	}

	get view() {
		return this.controller.view!;
	}

	get shouldShowHeading() {
		const { h1, h2 } = this.controller.capabilities;
		return h1 && h2;
	}

	mounted() {
		this.onVisibleChanged();
	}

	get visible() {
		if (!this.controller.scope.hasSelection) {
			return false;
		}

		return this.controller.capabilities.hasTextControls;
	}

	get isAutolink() {
		return !!this.controller.scope.autolink;
	}

	get isInHeading() {
		return this.headingLevel !== null;
	}

	get headingLevel() {
		return this.controller.scope.headingLevel;
	}

	get left() {
		const {
			scope: { cursorStart, cursorEnd },
			window,
		} = this.controller;

		if (!cursorStart || !cursorEnd || !this.visible) {
			return this.oldLeft;
		}

		const left =
			Math.max((cursorStart.left + cursorEnd.left) / 2, cursorStart.left + 3) -
			this.containerWidth / 2;

		this.oldLeft = left - window.left + 'px';
		return this.oldLeft;
	}

	get bottom() {
		const {
			scope: { cursorStart, cursorEnd },
			window,
		} = this.controller;

		if (!cursorStart || !cursorEnd || !this.visible) {
			return this.oldBottom;
		}

		// max/min are used to constrain the controls within the scrolling view.
		this.oldBottom =
			Math.max(0, Math.min(window.height, window.top + window.height - cursorStart.top)) +
			16 +
			'px';
		return this.oldBottom;
	}

	@Watch('visible')
	private async onVisibleChanged() {
		await nextTick();
		if (this.visible) {
			// Wait for the container to become visible before getting width.
			this.containerWidth = this.$refs.container.clientWidth;
		}
	}

	hasMark(markType: keyof typeof this.controller.scope) {
		return !!this.controller.scope[markType];
	}

	onClickBold() {
		editorToggleMark(this.controller, this.view.state.schema.marks.strong);
	}

	onClickItalic() {
		editorToggleMark(this.controller, this.view.state.schema.marks.em);
	}

	onClickStrikethrough() {
		editorToggleMark(this.controller, this.view.state.schema.marks.strike);
	}

	onClickCode() {
		editorToggleMark(this.controller, this.view.state.schema.marks.code);
	}

	async onClickLink() {
		if (this.isAutolink) {
			return;
		}

		if (this.hasMark('link')) {
			// Remove the link mark
			editorUnlink(this.controller);
		} else {
			const selectedText = editorGetSelectedText(this.controller);
			const result = await ContentEditorLinkModal.show(selectedText);

			if (result) {
				editorLink(this.controller, result.href);
			}
		}
	}

	onClickHeading(level: 2 | 1) {
		editorToggleHeading(this.controller, level);
	}
}
</script>

<template>
	<div
		ref="container"
		class="content-editor-text-controls"
		:style="{
			bottom: bottom,
			left: left,
		}"
		:class="{
			'controls-desktop': !Screen.isXs,
			'controls-mobile': Screen.isXs,
		}"
	>
		<transition name="fade">
			<div v-if="visible">
				<button
					v-if="contextCapabilities.textBold && !isInHeading"
					v-app-tooltip="$gettext('Bold (Ctrl+B)')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('bold'),
					}"
					@click.prevent="onClickBold"
					@mousedown.prevent
				>
					<AppJolticon icon="bold" />
				</button>
				<button
					v-if="contextCapabilities.textItalic"
					v-app-tooltip="$gettext('Italic (Ctrl+I)')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('italic'),
					}"
					@click.prevent="onClickItalic"
					@mousedown.prevent
				>
					<AppJolticon icon="italic" />
				</button>
				<button
					v-if="contextCapabilities.textStrike"
					v-app-tooltip="$gettext('Strikethrough')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('strike'),
					}"
					@click.prevent="onClickStrikethrough"
					@mousedown.prevent
				>
					<AppJolticon icon="strikethrough" />
				</button>
				<button
					v-if="contextCapabilities.textLink && contextCapabilities.customLink"
					v-app-tooltip="$gettext(isAutolink ? 'Autolinked' : 'Link (Ctrl+K)')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('link') || isAutolink,
					}"
					@click.prevent="onClickLink"
					@mousedown.prevent
				>
					<AppJolticon icon="link" />
				</button>
				<button
					v-if="contextCapabilities.textCode"
					v-app-tooltip="$gettext('Code (Ctrl+`)')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('code'),
					}"
					@click.prevent="onClickCode"
					@mousedown.prevent
				>
					<AppJolticon icon="brackets" />
				</button>

				<template v-if="shouldShowHeading">
					<span class="control-separator" />
					<button
						v-app-tooltip="$gettext('Heading Level 1')"
						class="control-button"
						:class="{
							'control-button-active': headingLevel === 1,
						}"
						@click.prevent="onClickHeading(1)"
						@mousedown.prevent
					>
						<AppJolticon icon="h1" />
					</button>
					<button
						v-app-tooltip="$gettext('Heading Level 2')"
						class="control-button"
						:class="{
							'control-button-active': headingLevel === 2,
						}"
						@click.prevent="onClickHeading(2)"
						@mousedown.prevent
					>
						<AppJolticon icon="h2" />
					</button>
				</template>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
@import './variables'

.fade-enter-active
.fade-leave-active
	transition: opacity 0.05s, transform 0.05s

.fade-enter-from
.fade-leave-to
	opacity: 0
	transform: translateY(20px) scale(0.5)

.content-editor-text-controls
	z-index: $zindex-content-editor

.controls-mobile
	position: fixed
	bottom: 0 !important
	left: 0 !important
	right: 0 !important

	& > div
		display: flex
		justify-content: center
		align-items: center
		padding-left: 4px
		padding-right: 4px

		& > .control-button
			padding-top: 0
			padding-bottom: 0

		& > .control-button > span
			margin: $controls-margin-vertical $controls-margin-horizontal
			font-size: $controls-font-size !important

		& > .control-button-active > span
			theme-prop('color', 'bi-bg', true)

.controls-desktop
	position: absolute

	& > div
		elevate-2()
		rounded-corners-lg()
		change-bg('darkest')
		display: flex
		justify-content: flex-start
		align-items: center
		padding: 10px 8px 8px 8px

		&:before
			caret(color: var(--theme-darkest), direction: 'down', size: 8px)
			content: ''
			display: block

		& > .control-button
			padding-left: 2px
			padding-right: 2px

			& > span
				theme-prop('color', 'lighter')
				font-size: $controls-font-size !important

		& > .control-button-active > span
			theme-prop('color', 'highlight', true)

.control-button
	cursor: pointer
	display: inline-block
	pressy()
	background-color: transparent
	border-style: none

.control-separator
	display: inline-block
	change-bg('bg-subtle')
	width: 2px
	height: 20px
	line-height: 20px
	margin: 0 10px
</style>
