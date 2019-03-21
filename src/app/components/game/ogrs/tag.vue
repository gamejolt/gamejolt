<template>
	<div class="game-ogrs-tag theme-dark">
		<app-theme-svg class="-tag" :src="imgTagUrl" width="80" height="16" :alt="imgTag" />
		<template v-if="full">
			<app-theme-svg class="-face" :src="imgUrl" width="80" height="80" alt="" />
			<img class="-logo" src="./ogrs-logo.svg" width="76" height="8" alt="OGRS" />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.game-ogrs-tag
	display: inline-block
	margin-bottom: 0
	vertical-align: middle
	border: 4px solid $black
	background: $black

	>>> img
		display: block
		margin-left: auto
		margin-right: auto

.-face, .-logo
	margin-top: 4px
</style>

<script lang="ts" src="./tag" />
