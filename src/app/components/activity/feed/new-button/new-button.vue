<template>
	<div class="activity-feed-new-button -container">
		<a class="-button" @click="emitClick">
			<slot />
		</a>
	</div>
</template>

<style lang="stylus" scoped>
@require '../variables'
@require '~styles-lib/mixins'

.-container
	padding-bottom: $-item-padding-v

.-button
	-activity-feed-item()
	theme-prop('color', 'fg')
	display: block
	font-weight: $button-md-font-weight
	font-size: $button-md-font-size
	text-transform: uppercase
	text-align: center
</style>

<script lang="ts" src="./new-button"></script>
