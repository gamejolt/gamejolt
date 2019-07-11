<template>
	<div>
		<div class="game-list-item" v-for="i of num">
			<div class="-thumb">
				<div class="-placeholder-thumb" />
			</div>
			<div class="-meta">
				<div class="-placeholder-title" />
				<div class="-placeholder-dev" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require '../list-common'

.-placeholder
	&-thumb
		rounded-corners-lg()
		change-bg('bg-subtle')
		position: relative
		height: 0
		padding-top: 56.25% // HD 16:9
		overflow: hidden

	&-title
		lazy-placeholder-block()

	&-dev
		lazy-placeholder-block()
		margin-top: 6px
		width: 60%
</style>

<script lang="ts" src="./placeholder"></script>
