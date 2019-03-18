<template>
	<div class="row game-collection-grid">
		<div
			class="col-xs-12 col-sm-6 col-lg-4 game-collection-grid-item"
			v-for="collection of collections"
			:key="collection._id"
		>
			<app-game-collection-grid-item :collection="collection" :event-label="eventLabel" />
		</div>
	</div>
</template>

<script lang="ts" src="./grid" />
