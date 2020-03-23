<template>
	<div class="-card">
		<div class="-img">
			<span class="-img-hidden">
				<app-jolticon icon="other-os" big />
			</span>
		</div>
		<div class="-pocket fill-darkest">
			<div class="-name">
				???
			</div>
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
	margin: 10px
	width: 130px
	height: 130px
	display: flex
	justify-content: center
	align-items: center

.-pocket
	padding: 10px
	display: flex
	flex-direction: column
	align-items: center

.-name
	font-weight: bold

</style>

<script lang="ts" src="./hidden"></script>
