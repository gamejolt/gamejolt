<template>
	<div class="video-embed">
		<div class="video-embed-inner">
			<iframe
				v-if="videoProvider === 'youtube' && embedUrl"
				nwdisable
				nwfaketop
				type="text/html"
				frameborder="0"
				webkitallowfullscreen
				mozallowfullscreen
				allowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>

			<iframe
				v-if="videoProvider === 'vimeo' && embedUrl"
				nwdisable
				nwfaketop
				frameborder="0"
				webkitallowfullscreen
				mozallowfullscreen
				allowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.video-embed
	iframe
		display: block
</style>

<script lang="ts" src="./embed"></script>
