<script lang="ts" src="./thumbnail"></script>

<template>
	<router-link
		class="-item"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		:title="community.name"
		@click.native="onGotoCommunity"
	>
		<div class="-thumb">
			<app-media-item-backdrop
				class="-thumb-inner"
				:media-item="community.thumbnail"
				radius="full"
			>
				<app-community-thumbnail-img class="-thumb-img" :community="community" />
			</app-media-item-backdrop>
		</div>

		<div class="-label">
			{{ community.name }}
		</div>
	</router-link>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-thumb
	img-circle()
	change-bg('bg-offset')
	position: relative
	height: 0
	padding-top: 100%
	overflow: hidden

	&-inner
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%

.-label
	text-overflow()
	theme-prop('color', 'fg')
	font-weight: bold
	text-align: center
	margin-top: 8px

	.-item:hover &
		theme-prop('color', 'link')
</style>
