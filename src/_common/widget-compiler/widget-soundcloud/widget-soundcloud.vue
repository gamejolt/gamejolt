<template>
	<iframe
		class="widget-compiler-widget-soundcloud"
		nwdisable
		nwfaketop
		width="100%"
		height="166"
		scrolling="no"
		frameborder="no"
		:src="embedSrc"
	></iframe>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.widget-compiler-widget-soundcloud
	display: block
	margin-bottom: $line-height-computed
</style>

<script lang="ts" src="./widget-soundcloud"></script>
