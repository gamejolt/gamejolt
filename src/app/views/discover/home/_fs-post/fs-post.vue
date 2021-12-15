<script lang="ts" src="./fs-post"></script>

<template>
	<div class="home-fs-post theme-dark">
		<div class="-byline">
			<div class="-avatar">
				<app-user-avatar-img :user="post.user" />
			</div>
			<div class="-byline-info">
				<div class="-username">@{{ post.user.username }}</div>
				<div class="-communities">
					<app-community-overlay-pill
						v-for="postCommunity of post.communities"
						:key="postCommunity.id"
						:community="postCommunity.community"
					/>
				</div>
			</div>
		</div>

		<div class="-bg">
			<div class="-backdrop">
				<app-img-responsive
					class="-backdrop-img"
					:class="{
						'-loaded': imgLoaded,
					}"
					:src="mediaItem.mediaserver_url"
					alt=""
					@imgloadchange="onImageLoad"
				/>
			</div>

			<div class="-shade" />

			<template v-if="videoController">
				<app-video
					class="-video"
					:player="videoController"
					should-play
					allow-degraded-autoplay
				/>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-bg
.-backdrop
.-shade
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0

.-backdrop-img
	position: relative
	width: 100%
	height: 100%
	object-fit: cover
	opacity: 0
	transition-duration: 1s

	&.-loaded
		opacity: 1

.-shade
	background-color: rgba(0, 0, 0, 0.4)

.-video
	position: relative
	width: 100%
	height: 100%

	>>> > video
		height: 100% !important
		width: 100% !important
		object-fit: cover

.-byline
	position: absolute
	bottom: 0
	right: 0
	left: 0
	display: flex
	flex-direction: row
	align-items: center
	padding: 24px
	background: linear-gradient(180deg, rgba($black 0) 0%, $black 100%)
	z-index: 1

	&-info
		display: flex
		flex-direction: column
		margin-left: 16px

.-avatar
	width: 64px
	height: 64px
	flex: none

.-username
	font-weight: bold

.-communities
	margin-top: 4px
	white-space: nowrap
	overflow: hidden

@media $media-xs
	.-byline
		padding: 8px 16px

	.-byline-info
		flex-direction: row
		align-items: center
		margin-left: 8px

	.-avatar
		width: 32px
		height: 32px

	.-username
		text-overflow()
		font-size: 11px
		max-width: 100px

	.-communities
		margin-left: 16px
</style>
