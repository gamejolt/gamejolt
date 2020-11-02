<script lang="ts" src="./ghost"></script>

<template>
	<div class="sticker-ghost" :class="itemClasses" @click.stop @contextmenu.prevent>
		<div class="-img-outer" @mousedown="onStartDrag" @touchstart="onStartDrag">
			<img
				class="-img-inner"
				draggable="false"
				style="user-drag: none"
				:style="itemStyling"
				:src="sticker.img_url"
				@dragstart.prevent
			/>
		</div>
		<transition name="-fade">
			<div v-if="shouldShowStickerControls" class="-controls" :style="controlsStyling">
				<template v-if="!isCommentOpen">
					<app-button
						v-app-tooltip.bottom="this.$gettext(`Add Comment`)"
						icon="comment"
						solid
						sparse
						circle
						@click.capture="onOpenComment"
					/>
					&nbsp;&nbsp;
				</template>
				<app-button
					v-app-tooltip.bottom="this.$gettext(`Place`)"
					icon="check"
					primary
					solid
					sparse
					circle
					@click.capture="onConfirmPlacement"
				/>
			</div>
		</transition>
		<div v-if="shouldShowComment" class="-comment" :style="commentStyle">
			<form-comment
				:placeholder="$gettext(`Annotate your Sticker`)"
				:comment-model="commentParentModel"
				:model="comment"
				slim
				is-sticker
				@changed="onCommentContentChanged"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-uncommitted
	filter: drop-shadow(2px 2px 2.5px black)

.-dragging
	filter: drop-shadow(4px 4px 5px black)
	pointer-events: none

.sticker-ghost
	position: absolute
	top: 0
	left: 0
	cursor: grab
	touch-action: none

.-img
	&-outer
		z-index: 2

	&-inner
		display: block
		user-select: none
		width: 100%
		height: 100%
		filter: drop-shadow(2px 2px 0 white) drop-shadow(-2px 2px 0 white) drop-shadow(2px -2px 0 white) drop-shadow(-2px -2px 0 white)

.-fade
	&-enter-active
		transition: opacity 250ms $strong-ease-out

	&-enter
		opacity: 0

	&-enter-to
		opacity: 1

.-controls
	rounded-corners()
	display: flex
	justify-content: center
	align-items: center
	position: absolute
	top: calc(100% + 8px)
	z-index: 1

.-comment
	position: absolute
	width: 300px
	z-index: -1
	animation-name: comment-intro
	animation-duration: 0.25s
	animation-iteration-count: 1
	animation-direction: normal

@keyframes comment-intro
	0%
		transform: scale(110%)
		opacity: 0

	100%
		transform: scale(100%)
		opacity: 1
</style>
