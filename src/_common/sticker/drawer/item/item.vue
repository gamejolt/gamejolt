<script lang="ts" src="./item"></script>

<template>
	<div class="-item" draggable="false" @contextmenu.prevent>
		<div :class="{ '-out-of-stock': count === 0 }">
			<img
				draggable="false"
				class="-img"
				:style="itemStyling"
				:src="sticker.img_url"
				@mousedown="onMouseDown"
				@touchstart="onTouchStart"
				@touchmove="onTouchMove"
				@touchend="onTouchEnd"
				@dragstart.prevent
			/>
		</div>

		<div v-if="!hideCount" class="-pocket badge fill-dark">
			<div
				class="-rarity"
				:class="{
					'-rarity-uncommon': sticker.rarity === 1,
					'-rarity-rare': sticker.rarity === 2,
					'-rarity-epic': sticker.rarity === 3,
				}"
			>
				{{ count }}
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	position: relative
	height: 64px
	width: 64px
	user-drag: none
	user-select: none
	touch-action: none

.-out-of-stock
	filter: contrast(0)

.-img
	filter: drop-shadow(2px 2px 0 white) drop-shadow(-2px 2px 0 white) drop-shadow(2px -2px 0 white) drop-shadow(-2px -2px 0 white)

.-pocket
	position: absolute
	bottom: 0
	right: 0
	pointer-events: none

.-rarity
	font-weight: bold

	&-uncommon
		color: #1bb804

	&-rare
		color: #18a5f2

	&-epic
		color: #ffbc56
</style>
