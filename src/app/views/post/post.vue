<template>
	<app-post-page-placeholder v-if="!post" />
	<app-post-page v-else :post="post" />
</template>

<script lang="ts" src="./post"></script>
