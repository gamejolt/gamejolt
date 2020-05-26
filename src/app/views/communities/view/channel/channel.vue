<template>
	<app-communities-view-page-container>
		<app-communities-view-feed :feed="feed" @add-post="onPostAdded" />
	</app-communities-view-page-container>
</template>

<script lang="ts" src="./channel"></script>
