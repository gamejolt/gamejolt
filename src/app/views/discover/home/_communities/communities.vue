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

		<app-community-slider-placeholder v-if="isLoading" :num="10" with-add-button />
		<app-community-slider
			v-else-if="communities.length"
			:communities="communities"
			with-add-button
			event-cat="home"
		/>
	</div>
</template>

<script lang="ts" src="./communities"></script>
