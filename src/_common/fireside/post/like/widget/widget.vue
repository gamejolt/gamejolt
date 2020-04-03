<template>
	<span class="fireside-post-like-widget">
		<span class="-like">
			<app-button
				icon="heart"
				circle
				:trans="trans"
				:overlay="overlay"
				:block="block"
				:primary="!!post.user_like"
				:solid="!!post.user_like"
				:inset="inset"
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

		<a @click="showLikers()" v-app-tooltip="$gettext(`View all people that liked this post`)">
			<span v-if="blip && !hideBlip" class="blip" :class="{ filled: !!post.user_like }">
				<span class="blip-caret"></span>
				<span class="blip-count">{{ blip }}</span>
			</span>
		</a>
	</span>
</template>

<style lang="stylus" scoped>
.-like
	position: relative

.-like-anim-container
	position: absolute
	top: 0
	left: -2px
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

@keyframes like-anim
	0%
		transform: scale(1)
		opacity: 1

	100%
		transform: scale(6)
		opacity: 0

.-dislike-anim
	position: absolute
	animation-duration: 1s
	animation-iteration-count: 1
	animation-fill-mode: forwards

	&.-left
		animation-name: dislike-anim-left
		clip-path: polygon(50% 0%, 50% 100%, 0% 100%, 0% 0%)
		// clip-path: polygon(50% 0%, 50% 20%, 40% 40%, 60% 60%, 45% 80%, 50% 100%, 0% 100%, 0% 0%)

	&.-right
		animation-name: dislike-anim-right
		clip-path: polygon(50% 0%, 50% 100%, 100% 100%, 100% 0%)
		// clip-path: polygon(50% 0%, 50% 20%, 40% 40%, 60% 60%, 45% 80%, 50% 100%, 100% 100%, 100% 0%)



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
