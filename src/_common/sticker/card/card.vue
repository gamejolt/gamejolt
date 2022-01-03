<script lang="ts" src="./card"></script>

<template>
	<div class="-card">
		<img class="-img" :src="sticker.img_url" />
		<div v-if="label" class="-pocket fill-darkest">
			<div
				class="-rarity"
				:class="{
					'-rarity-uncommon': sticker.rarity === 1,
					'-rarity-rare': sticker.rarity === 2,
					'-rarity-epic': sticker.rarity === 3,
				}"
			>
				{{ label }}
			</div>
		</div>
		<div v-if="isNew" class="-new-indicator">
			<span v-app-tooltip.touchable="$gettext(`Newly unlocked!`)" class="-new-icon" />
		</div>

		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@import './variables'

.-card
	change-bg('bg-offset')
	width: $card-width
	rounded-corners-lg()
	position: relative
	overflow: hidden
	elevate-hover-1()

.-img
	display: block
	margin: 12px
	width: 126px
	height: 126px

.-pocket
	padding: 12px
	display: flex
	flex-direction: column
	align-items: center

.-rarity
	font-weight: bold

	&-uncommon
		color: #1bb804

	&-rare
		color: #18a5f2

	&-epic
		color: #ffbc56

.-new-indicator
	position: absolute
	top: 12px
	right: 12px

.-new-icon
	display: block
	width: 12px
	height: 12px
	border-radius: 50%
	background-color: var(--theme-bi-bg)
	elevate-2()
</style>
