<template>
	<div>
		<app-loading v-if="isLoading" :big="true" />

		<app-graph v-if="!isLoading && graphData" :dataset="graphData.graph" />
	</div>
</template>

<script lang="ts" src="./widget"></script>
