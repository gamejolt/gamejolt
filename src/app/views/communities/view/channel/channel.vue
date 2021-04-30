<script lang="ts" src="./channel"></script>

<template>
	<div v-if="channel">
		<route-communities-view-channel-jam v-if="channel.type === 'competition'" />
		<route-communities-view-channel-feed v-else />
	</div>
</template>

<style lang="stylus" scoped>
.-container
	padding-bottom: 0
</style>
