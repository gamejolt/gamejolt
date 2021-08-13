<script lang="ts" src="./embed"></script>

<template>
	<div class="sketchfab-embed">
		<div class="sketchfab-embed-inner">
			<iframe
				nwdisable
				nwfaketop
				frameborder="0"
				allowvr
				allowfullscreen
				mozallowfullscreen
				webkitallowfullscreen
				:width="width"
				:height="height"
				:src="embedUrl"
			/>
		</div>
	</div>
</template>
