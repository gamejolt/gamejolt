<script lang="ts" src="./firesides"></script>

<template>
	<app-communities-view-page-container full>
		<app-illustration v-if="!community.allow_firesides" src="~img/ill/no-comments.svg">
			<p>
				<translate>This community doesn't allow firesides.</translate>
			</p>
		</app-illustration>
		<app-illustration
			v-else-if="isRouteBootstrapped && firesides.length === 0"
			src="~img/ill/no-comments.svg"
		>
			<p>
				<translate>There are no active firesides in this community yet.</translate>
			</p>
		</app-illustration>
		<app-firesides-list v-else :url="loadUrl" :initial-firesides="firesides" />
	</app-communities-view-page-container>
</template>
