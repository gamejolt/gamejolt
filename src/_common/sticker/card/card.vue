<template>
	<div class="-card">
		<img class="-img" :src="sticker.img_url" />
		<div v-if="count" class="-pocket fill-darkest">
			<div>x{{ count }}</div>
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
