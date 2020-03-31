<template>
	<div class="-card">
		<img class="-img" :src="sticker.img_url" />
		<div class="-pocket fill-darkest">
			<div
				class="-name"
				:class="{
					'-rarity-uncommon': sticker.rarity === 1,
					'-rarity-rare': sticker.rarity === 2,
					'-rarity-epic': sticker.rarity === 3,
				}"
				:title="rarityLabel"
			>
				{{ sticker.name }}
			</div>
			<div v-if="count">x{{ count }}</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-card
	change-bg('bg-offset')
	width: 150px
	rounded-corners-lg()
	position: relative
	overflow: hidden

	&:hover
		elevate-1()

.-img
	display: block
	margin: 10px
	width: 130px
	height: 130px

.-pocket
	padding: 10px
	display: flex
	flex-direction: column
	align-items: center

.-name
	font-weight: bold

.-rarity
	&-uncommon
		color: #1bb804
	&-rare
		color: #18a5f2
	&-epic
		color: #ffbc56
</style>

<script lang="ts" src="./card"></script>
