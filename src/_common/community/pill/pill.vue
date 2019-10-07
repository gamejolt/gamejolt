<template>
	<app-pill :to="to">
		<app-community-thumbnail-img slot="img" :community="community" />

		{{ community.name }}
		<app-community-verified-tick :community="community" small />
	</app-pill>
</template>

<script lang="ts" src="./pill"></script>
