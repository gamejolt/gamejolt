<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import AppEmoji, { GJ_EMOJIS } from '../../../../emoji/AppEmoji.vue';
import { EmojiModal } from '../../../../emoji/modal/modal.service';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
import { editorInsertEmoji, useContentEditorController } from '../../content-editor-controller';

const controller = useContentEditorController()!;

// gets set to a random one at mounted
const emoji = ref<(typeof GJ_EMOJIS)[number]>('huh');

const visible = computed(() => controller.scope.isFocused && controller.capabilities.emoji);

function setRandomEmoji() {
	const prev = emoji.value;
	do {
		const emojiIndex = Math.floor(Math.random() * GJ_EMOJIS.length);
		emoji.value = GJ_EMOJIS[emojiIndex];
	} while (prev === emoji.value);
}

onMounted(() => {
	setRandomEmoji();

	// Register the panel interface with the controller.
	controller._emojiPanel = {
		show: () => show(),
	};
});

onUnmounted(() => {
	controller._emojiPanel = undefined;
});

function onMouseEnter() {
	setRandomEmoji();
}

async function show() {
	const emoji = await EmojiModal.show({ resource: undefined });
	if (emoji) {
		editorInsertEmoji(controller, emoji);
	}
}
</script>

<template>
	<div class="inset-container-controls">
		<transition name="fade">
			<AppEmoji
				v-if="visible"
				v-app-tooltip="$gettext('Insert Emoji')"
				class="emoji-button"
				:emoji="emoji"
				tabindex="1"
				@click="show"
				@mouseenter="onMouseEnter"
			/>
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
</style>
