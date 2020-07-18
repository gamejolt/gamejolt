<template>
	<div class="-container">
		<app-theme-svg class="-ill" :src="src" />
		<div class="-text" :class="{ '-sm': sm }" v-if="hasContent">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

$-font-size-xs = 16px
$-font-size = 19px

.-container
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	text-align: center

.-ill
	margin: $line-height-computed 0

.-text
	color: var(--theme-fg-muted)
	font-size: $-font-size-xs
	max-width: 500px

	@media $media-sm-up
		&:not(.-sm)
			font-size: $-font-size
</style>

<script lang="ts" src="./illustration"></script>

