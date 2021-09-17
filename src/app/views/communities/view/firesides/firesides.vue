<script lang="ts" src="./firesides"></script>

<template>
	<app-communities-view-page-container full>
		<div v-if="!community.allow_firesides" class="alert alert-info">
			<translate> This community doesn't allow firesides in it. </translate>
		</div>
		<div v-else-if="isRouteBootstrapped && firesides.length === 0" class="alert alert-info">
			<translate> There are no firesides in this community yet. </translate>
		</div>
		<app-firesides-list v-else :url="loadUrl" :initial-firesides="firesides" />
	</app-communities-view-page-container>
</template>
