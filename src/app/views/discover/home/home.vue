
<script lang="ts" src="./home"></script>

<template>
	<app-home-default
		v-if="split === 'default'"
		:is-bootstrapped="isRouteBootstrapped"
		:featured-item="featuredItem"
		:featured-communities="featuredCommunities"
		:featured-fireside="featuredFireside"
	/>
	<app-home-slider v-else-if="split === 'hero'" :posts="heroPosts" />
</template>
