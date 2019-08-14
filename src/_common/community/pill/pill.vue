<template>
	<app-pill :to="to">
		<app-community-thumbnail-img slot="img" :community="community" />

		{{ community.name }}
	</app-pill>
</template>

<script lang="ts" src="./pill"></script>
