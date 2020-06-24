<template>
	<div class="-card">
		<div class="-img">
			<app-jolticon class="-icon jolticon-3x" icon="sticker" />
		</div>
		<div class="-pocket fill-darkest">
			<translate
				:translate-n="count + 1"
				:translate-params="{ count: count }"
				translate-plural="Unlock %{count}"
			>
				Unlocking...
			</translate>
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
	margin: 12px
	width: 126px
	height: 126px
	display: flex
	justify-content: center
	align-items: center

.-pocket
	padding: 12px
	display: flex
	flex-direction: column
	align-items: center
	font-weight: bold
</style>

<script lang="ts" src="./hidden"></script>
