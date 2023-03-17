<script lang="ts">
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Vue } from 'vue-property-decorator';
import AppEmoji, { GJ_EMOJIS } from '../../../../emoji/AppEmoji.vue';
import { EmojiModal } from '../../../../emoji/modal/modal.service';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
import { editorInsertEmoji, useContentEditorController } from '../../content-editor-controller';

@Options({
	components: {
		AppEmoji,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppContentEditorControlsEmoji extends Vue {
	controller = setup(() => useContentEditorController()!);

	emoji = 'huh'; // gets set to a random one at mounted
	panelVisible = false;
	clickedWithPanelVisible = false;

	declare $refs: {
		panel: HTMLElement;
	};

	@Emit('visibility-change')
	emitVisibilityChange(_visible: boolean) {}

	get visible() {
		return this.controller.scope.isFocused && this.controller.capabilities.emoji;
	}

	get emojis() {
		return GJ_EMOJIS;
	}

	private setPanelVisibility(visible: boolean) {
		if (this.panelVisible !== visible) {
			this.panelVisible = visible;
			this.emitVisibilityChange(visible);
		}
	}

	private setRandomEmoji() {
		const prev = this.emoji;
		do {
			const emojiIndex = Math.floor(Math.random() * GJ_EMOJIS.length);
			this.emoji = GJ_EMOJIS[emojiIndex];
		} while (prev === this.emoji);
	}

	mounted() {
		this.setRandomEmoji();

		// Register the panel interface with the controller.
		this.controller._emojiPanel = {
			show: () => this.show(),
		};
	}

	unmounted() {
		this.controller._emojiPanel = undefined;
	}

	onMouseEnter() {
		if (!this.panelVisible) {
			this.setRandomEmoji();
		}
	}

	onMouseDown() {
		this.clickedWithPanelVisible = this.panelVisible;
	}

	onButtonClick() {
		if (this.clickedWithPanelVisible) {
			this.setPanelVisibility(false);
		} else {
			this.show();
		}
	}

	onPanelFocus() {
		this.setPanelVisibility(true);
	}

	onPanelBlur() {
		this.setPanelVisibility(false);
	}

	onClickEmoji(emojiType: string) {
		editorInsertEmoji(this.controller, { emojiType });
	}

	public async show() {
		// TODO(reactions) cleanup
		const emojo = await EmojiModal.show({ resource: undefined });
		if (emojo) {
			editorInsertEmoji(this.controller, {
				emojiType: emojo.short_name,
				emojiSrc: emojo.img_url,
			});
		}
		return;

		this.setPanelVisibility(true);
		await nextTick();
		this.$refs.panel.focus();
	}
}
</script>

<template>
	<div class="inset-container-controls">
		<transition name="fade">
			<AppEmoji
				v-if="visible"
				v-app-tooltip="panelVisible ? '' : $gettext('Insert Emoji')"
				class="emoji-button"
				:class="{
					'emoji-button-active': panelVisible,
				}"
				:emoji="emoji"
				tabindex="1"
				@click="onButtonClick"
				@mousedown="onMouseDown"
				@mouseenter="onMouseEnter"
			/>
		</transition>
		<transition name="fade">
			<div
				v-if="visible && panelVisible"
				ref="panel"
				class="emoji-panel"
				tabindex="1"
				@focus="onPanelFocus"
				@blur="onPanelBlur"
			>
				<div
					v-for="emoji of emojis"
					:key="emoji"
					class="emoji-box"
					:title="':' + emoji + ':'"
					@click="onClickEmoji(emoji)"
				>
					<AppEmoji :emoji="emoji" />
				</div>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 0.05s

.fade-enter-from
.fade-leave-to
	opacity: 0

.emoji-button
	transition: filter 0.15s, transform 0.2s ease
	cursor: pointer
	image-rendering: pixelated

	&:not(:hover)
		filter: grayscale(1) opacity(75%)

	&:hover
		transform: scale(1.2)

	&:focus
		outline: none

.emoji-button-active
	filter: none !important
	transform: scale(1.2)

.emoji-panel
	elevate-2()
	rounded-corners-lg()
	change-bg('bg-offset')
	position: absolute
	bottom: 32px
	right: -8px
	display: flex
	flex-wrap: wrap
	width: 320px
	padding: 10px 8px 8px 8px
	z-index: $zindex-content-editor
	cursor: default

	&:focus
		outline: none

.emoji-box
	padding: 6px
	rounded-corners()
	cursor: pointer

	&:hover
		change-bg('bg-subtle')

	& > span
		cursor: pointer
</style>
