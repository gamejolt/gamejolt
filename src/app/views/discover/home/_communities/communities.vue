<template>
	<div>
		<h2 class="section-header sans-margin-bottom">
			<translate>Communities</translate>
		</h2>

		<p class="text-muted">
			<translate>
				Join a community to create and explore fanart, videos, game guides and more!
			</translate>
		</p>

		<app-community-slider :communities="communities" event-label="discover" />
	</div>
</template>

<script lang="ts" src="./communities"></script>
