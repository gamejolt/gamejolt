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
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require './variables'

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
</style>

<script lang="ts" src="./card"></script>
