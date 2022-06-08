<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { showErrorGrowl } from '../../../growls/growls.service';
import { Screen } from '../../../screen/screen-service';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import {
	editorInsertBlockquote,
	editorInsertBulletList,
	editorInsertCodeBlock,
	editorInsertEmbed,
	editorInsertHr,
	editorInsertNumberedList,
	editorInsertSpoiler,
	editorUploadImageFile,
	useContentEditorController,
} from '../content-editor-controller';

@Options({
	components: {},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppContentEditorBlockControls extends Vue {
	controller = setup(() => useContentEditorController()!);

	private oldTop = 0;

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

	get shouldShow() {
		return this.visible && this.top >= -24 && !this.isOverflowingBottom;
	}

	get isOverflowingBottom() {
		return this.controller.window.height - this.top < 24;
	}

	get collapsed() {
		return this.controller.controlsCollapsed;
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
		this.controller.controlsCollapsed = !this.controller.controlsCollapsed;
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
							showErrorGrowl({
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
		this.controller.controlsCollapsed = true;
		editorInsertEmbed(this.controller);
	}

	onClickCodeBlock() {
		this.controller.controlsCollapsed = true;
		editorInsertCodeBlock(this.controller);
	}

	onClickBlockquote() {
		this.controller.controlsCollapsed = true;
		editorInsertBlockquote(this.controller);
	}

	onClickHr() {
		this.controller.controlsCollapsed = true;
		editorInsertHr(this.controller);
	}

	onClickSpoiler() {
		this.controller.controlsCollapsed = true;
		editorInsertSpoiler(this.controller);
	}

	onClickBulletList() {
		this.controller.controlsCollapsed = true;
		editorInsertBulletList(this.controller);
	}

	onClickOrderedList() {
		this.controller.controlsCollapsed = true;
		editorInsertNumberedList(this.controller);
	}
}
</script>

<template>
	<div
		ref="container"
		class="content-editor-controls"
		:style="{
			top: top + 'px',
			left: '-32px',
		}"
		:class="{
			'-controls-desktop': !Screen.isXs,
			'-controls-mobile': Screen.isXs,
		}"
		tabindex="0"
	>
		<!-- ^ Tab index is 0 so that the main content editor does not focus when clicking the buttons -->
		<!-- When adding new buttons here, make sure they are added in both mobile and desktop views -->
		<transition name="fade">
			<div v-if="shouldShow">
				<template v-if="Screen.isXs">
					<button
						v-if="contextCapabilities.media"
						v-app-tooltip="$gettext('Add an image or GIF')"
						type="button"
						class="-mobile-control"
						@click="onClickMedia"
					>
						<AppJolticon icon="screenshot" />
					</button>
					<button
						v-if="contextCapabilities.hasAnyEmbed"
						v-app-tooltip="$gettext('Add an embed')"
						type="button"
						class="-mobile-control"
						@click="onClickEmbed"
					>
						<AppJolticon icon="embed" />
					</button>
					<button
						v-if="contextCapabilities.codeBlock"
						v-app-tooltip="$gettext('Add a code block')"
						type="button"
						class="-mobile-control"
						@click="onClickCodeBlock"
					>
						<AppJolticon icon="brackets" />
					</button>
					<button
						v-if="contextCapabilities.blockquote"
						v-app-tooltip="$gettext('Add a quote')"
						type="button"
						class="-mobile-control"
						@click="onClickBlockquote"
					>
						<AppJolticon icon="blockquote" />
					</button>
					<button
						v-if="contextCapabilities.spoiler"
						v-app-tooltip="$gettext('Add a spoiler')"
						type="button"
						class="-mobile-control"
						@click="onClickSpoiler"
					>
						<AppJolticon icon="inactive" />
					</button>
					<button
						v-if="contextCapabilities.hr"
						v-app-tooltip="$gettext('Add a separator')"
						type="button"
						class="-mobile-control"
						@click="onClickHr"
					>
						<AppJolticon icon="hr" />
					</button>
					<button
						v-if="contextCapabilities.list"
						v-app-tooltip="$gettext('Add a bulleted list')"
						type="button"
						class="-mobile-control"
						@click="onClickBulletList"
					>
						<AppJolticon icon="bullet-list" />
					</button>
					<button
						v-if="contextCapabilities.list"
						v-app-tooltip="$gettext('Add a numbered list')"
						type="button"
						class="-mobile-control"
						@click="onClickOrderedList"
					>
						<AppJolticon icon="numbered-list" />
					</button>
				</template>
				<template v-else>
					<AppButton
						class="-add-button"
						:class="{
							'-add-button-rotated': !collapsed,
						}"
						circle
						solid
						:icon="'add'"
						@click="onClickExpand"
					/>
					<transition name="fade">
						<span v-if="!collapsed">
							<span class="dot-separator" />
							<AppButton
								v-if="contextCapabilities.media"
								v-app-tooltip="$gettext('Add an image or GIF')"
								class="-control anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="screenshot"
								@click="onClickMedia"
							/>
							<AppButton
								v-if="contextCapabilities.hasAnyEmbed"
								v-app-tooltip="$gettext('Add an embed')"
								class="-control anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="embed"
								@click="onClickEmbed"
							/>
							<AppButton
								v-if="contextCapabilities.codeBlock"
								v-app-tooltip="$gettext('Add a code block')"
								class="-control anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="brackets"
								@click="onClickCodeBlock"
							/>
							<AppButton
								v-if="contextCapabilities.blockquote"
								v-app-tooltip="$gettext('Add a quote')"
								class="-control anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="blockquote"
								@click="onClickBlockquote"
							/>
							<AppButton
								v-if="contextCapabilities.spoiler"
								v-app-tooltip="$gettext('Add a spoiler')"
								class="-control anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="inactive"
								@click="onClickSpoiler"
							/>
							<AppButton
								v-if="contextCapabilities.hr"
								v-app-tooltip="$gettext('Add a separator')"
								class="-control anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="hr"
								@click="onClickHr"
							/>
							<AppButton
								v-if="contextCapabilities.list"
								v-app-tooltip="$gettext('Add a bulleted list')"
								class="-control anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="bullet-list"
								@click="onClickBulletList"
							/>
							<AppButton
								v-if="contextCapabilities.list"
								v-app-tooltip="$gettext('Add a numbered list')"
								class="-control anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="numbered-list"
								@click="onClickOrderedList"
							/>
						</span>
					</transition>
				</template>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
@import './variables'

.content-editor-controls
	position: absolute
	z-index: $zindex-content-editor

	&:hover
		outline: 0 solid transparent !important

.-add-button
	transition: transform 0.2s ease

.-add-button-rotated
	transform: rotate(-45deg)

.fade-enter-active
.fade-leave-active
	transition: opacity 0.2s

.fade-enter-from
.fade-leave-to
	opacity: 0

.-control
.-mobile-control
	margin: 0 4px

.-controls-mobile
	position: fixed
	top: auto !important
	bottom: 0 !important
	left: 0 !important
	right: 0 !important

	& > div
		display: flex
		justify-content: center
		align-items: center
		padding-left: 4px
		padding-right: 4px

		& > .-mobile-control
			padding-top: 0
			padding-bottom: 0

		& > .-mobile-control > span
			margin: $controls-margin-vertical $controls-margin-horizontal
			font-size: $controls-font-size !important

.-mobile-control
	cursor: pointer
	display: inline-block
	pressy()
	background-color: transparent
	border-style: none

.btn-stagger
	for i in 2 .. 40
		&:nth-child({i})
			animation-delay: 20ms * i
</style>
