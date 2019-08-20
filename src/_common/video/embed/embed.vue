<template>
	<div class="video-embed">
		<div class="video-embed-inner">
			<iframe
				nwdisable
				nwfaketop
				type="text/html"
				frameborder="0"
				webkitallowfullscreen
				mozallowfullscreen
				allowfullscreen
				v-if="videoProvider === 'youtube' && embedUrl"
				:width="width"
				:height="height"
				:src="embedUrl"
			></iframe>

			<iframe
				nwdisable
				nwfaketop
				frameborder="0"
				webkitallowfullscreen
				mozallowfullscreen
				allowfullscreen
				v-if="videoProvider === 'vimeo' && embedUrl"
				:width="width"
				:height="height"
				:src="embedUrl"
			></iframe>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.video-embed
	iframe
		display: block
</style>

<script lang="ts" src="./embed"></script>
