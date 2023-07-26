<script lang="ts" setup>
import { PropType, onMounted, onUnmounted, ref, toRefs } from 'vue';
import AppButton from '../../button/AppButton.vue';
import { addMinbarItem, removeMinbarItem } from '../../minbar/minbar.service';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { Game } from '../game.model';
import { showGameRatingGrowl } from '../rating-growl/rating-growl.service';

const props = defineProps({
	game: {
		type: Object as PropType<Game>,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	canMinimize: {
		type: Boolean,
	},
});

const { game, url, canMinimize } = toRefs(props);
const modal = useModal()!;

const isMinimized = ref(false);
const frameElem = ref<HTMLElement>();

onMounted(() => {
	document.body.classList.add('game-play-modal-open');
});

onUnmounted(() => {
	document.body.classList.remove('game-play-modal-open');
});

function focus() {
	frameElem.value?.focus();
}

function minimize() {
	isMinimized.value = true;

	// We basically animate it out but keep it in the DOM.
	// This is so we don't lose the game when closing it.
	document.body.classList.remove('game-play-modal-open');

	// When this minbar item is clicked, it basically shows this modal again.
	const minbarItem = addMinbarItem({
		title: game.value.title,
		thumb: game.value.img_thumbnail,
		isActive: true, // Only one game open at a time, so make it active.
		onClick: () => {
			// We remove the item from the minbar.
			removeMinbarItem(minbarItem);

			// Then we show the modal again.
			maximize();
		},
	});
}

function maximize() {
	isMinimized.value = false;

	// Add everything back in!
	document.body.classList.add('game-play-modal-open');
}

function close() {
	modal.dismiss();

	// Show a rating growl when they close the game play modal. This will
	// urge them to rate the game after playing it, but only if they haven't
	// rated it yet.
	showGameRatingGrowl(game.value);
}
</script>

<template>
	<div :style="{ display: isMinimized ? 'none' : 'block' }">
		<AppModal>
			<div class="fill-darkest">
				<div class="modal-controls -header-controls clearfix">
					<AppButton v-if="canMinimize" @click="minimize()">
						{{ $gettext(`Minimize`) }}
					</AppButton>
					<AppButton @click="close()">
						{{ $gettext(`Close`) }}
					</AppButton>
				</div>

				<div class="-body">
					<iframe
						v-if="url"
						ref="frame"
						class="-embed"
						nwdisable
						nwfaketop
						frameborder="0"
						scrolling="no"
						allowfullscreen
						:src="url"
						@load="focus()"
					/>
				</div>
			</div>
		</AppModal>
	</div>
</template>

<style lang="stylus" scoped>
::v-global(.game-play-modal-open)
	overflow: hidden !important

.-header-controls
	margin-top: -2px // Remove the top border from buttons.
	padding-bottom: ($grid-gutter-width-xs / 2)
	text-align: center

	@media $media-md-up
		padding-right: ($grid-gutter-width-xs / 2)
		text-align: right

.-body
	position: absolute
	top: 40px
	right: 0
	bottom: 0
	left: 0
	overflow: hidden

// This is the iframe to gameserver.
.-embed
	width: 100%
	height: 100%
</style>
