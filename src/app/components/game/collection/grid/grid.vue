<script lang="ts" src="./grid"></script>

<template>
	<div class="row game-collection-grid">
		<div
			v-for="collection of collections"
			:key="collection._id"
			class="col-xs-12 col-sm-6 col-lg-4 game-collection-grid-item"
		>
			<app-game-collection-grid-item :collection="collection" :event-label="eventLabel" />
		</div>
	</div>
</template>
