<template>
	<app-pill
		v-if="!community"
		:to="{
			name: 'communities.view.overview',
			params: {
				path: path,
			},
		}"
	>
		<slot />
	</app-pill>
	<app-community-pill v-else :community="community" />
</template>

<script lang="ts" src="./community"></script>
