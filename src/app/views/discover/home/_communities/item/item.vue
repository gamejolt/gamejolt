<script lang="ts" src="./item"></script>

<template>
	<div class="-item col-xs-4 col-sm-3 col-md-2">
		<router-link
			v-app-track-event="`home:communities:${community.id}`"
			:to="{
				name: 'communities.view.overview',
				params: { path: community.path },
			}"
			:title="community.name"
		>
			<div class="-backdrop-sizing">
				<app-media-item-backdrop
					class="-backdrop"
					:media-item="community.thumbnail"
					radius="full"
				>
					<app-community-thumbnail-img class="-thumb" :community="community" />
				</app-media-item-backdrop>
			</div>
			<div class="-label">
				{{ community.name }}
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-item
	margin-bottom: $line-height-computed

.-backdrop-sizing
	position: relative
	width: 100%
	padding-top: 100%

.-backdrop
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	background-color: var(--theme-bg-offset)

.-thumb
	width: 100%
	height: 100%

.-label
	text-overflow()
	theme-prop('color', 'fg')
	font-weight: bold
	font-size: $font-size-tiny
	text-align: center
	margin-top: 8px

	@media $media-sm-up
		font-size: $font-size-small

		.-item:hover &
			theme-prop('color', 'link')
</style>
