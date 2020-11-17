<script lang="ts" src="./item"></script>

<template>
	<router-link
		v-app-track-event="event"
		class="-item"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		:title="community.name"
	>
		<div class="-item">
			<app-media-item-backdrop
				class="-backdrop"
				:media-item="community.thumbnail"
				radius="full"
			>
				<app-community-thumbnail-img class="-thumb" :community="community" />
			</app-media-item-backdrop>
			<div class="-label">
				{{ community.name }}
			</div>
		</div>
	</router-link>
</template>

<style lang="stylus" scoped>
@import '../common.styl'

.-backdrop
	background-color: var(--theme-bi-bg)

.-thumb
	width: 100%
	height: 100%
</style>
