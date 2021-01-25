<script lang="ts" src="./channel"></script>

<template>
	<div>
		<template v-if="channel">
			<app-communities-view-channel-header />

			<router-view />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	padding-bottom: 0
</style>
