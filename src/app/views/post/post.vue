<script lang="ts" src="./post"></script>

<template>
	<app-post-page-placeholder v-if="!post" />
	<app-post-page v-else :post="post" :community-notifications="communityNotifications" />
</template>
