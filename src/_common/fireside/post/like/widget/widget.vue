<template>
	<span class="fireside-post-like-widget">
		<span class="-like">
			<app-button
				class="-like-button"
				icon="heart"
				circle
				:trans="trans"
				:overlay="overlay"
				:block="block"
				:primary="!!post.user_like"
				:solid="!!post.user_like"
				v-app-tooltip="tooltip"
				v-app-auth-required
				@click="toggleLike"
			/>

			<div v-if="showLikeAnim" class="-like-anim-container">
				<app-jolticon class="-like-anim" icon="heart" notice />
			</div>
			<div v-if="showDislikeAnim" class="-like-anim-container">
				<app-jolticon class="-dislike-anim -left" icon="heart" notice />
				<app-jolticon class="-dislike-anim -right" icon="heart" notice />
			</div>
		</span>

		<a
			class="blip"
			:class="{ 'blip-active': !!post.user_like, mobile: Screen.isXs }"
			@click="showLikers()"
			v-app-tooltip="$gettext(`View all people that liked this post`)"
		>
			{{ blip | fuzzynumber }}
		</a>
	</span>
</template>

<style lang="stylus" scoped>
.fireside-post-like-widget
	display: inline-flex

	.-like
		position: relative

		&-button
			width: 36px
			height: 36px

	.-like-anim-container
		position: absolute
		top: 0
		width: 100%
		height: 100%
		display: flex
		justify-content: center
		align-items: center
		pointer-events: none

		.jolticon
			margin: 0

	.-like-anim
		animation-name: like-anim
		animation-duration: 1s
		animation-iteration-count: 1
		animation-fill-mode: forwards

	.-dislike-anim
		position: absolute
		animation-duration: 1s
		animation-iteration-count: 1
		animation-fill-mode: forwards

		&.-left
			animation-name: dislike-anim-left
			clip-path: polygon(50% 0%, 50% 100%, 0% 100%, 0% 0%)

		&.-right
			animation-name: dislike-anim-right
			clip-path: polygon(50% 0%, 50% 100%, 100% 100%, 100% 0%)

@keyframes like-anim
	0%
		transform: scale(1)
		opacity: 1

	100%
		transform: scale(6)
		opacity: 0


@keyframes dislike-anim-left
	0%
		transform: scale(1)
		opacity: 1

	100%
		transform: scale(2)  rotate(-45deg) translate(-6px, -6px)
		opacity: 0

@keyframes dislike-anim-right
	0%
		transform: scale(1)
		opacity: 1

	100%
		transform: scale(2) rotate(45deg) translate(6px, -6px)
		opacity: 0
</style>

<script lang="ts" src="./widget"></script>
