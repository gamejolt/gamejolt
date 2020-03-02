<template>
	<div v-if="toggleUserFollow" class="-user-follow well fill-darkest anim-fade-in">
		<p class="small">
			<translate>
				Would you also like to follow this user?
			</translate>
			<br />
			<translate>You will get notified when they post new stuff.</translate>
		</p>
		<app-user-follow-widget :user="post.user" block event-label="fireside-post-like-widget" />
	</div>
</template>

<script lang="ts" src="./user-follow"></script>

<style lang="stylus" scoped>
@require '~styles/variables'

.-user-follow
	margin-top: $grid-gutter-width * 0.5;
	margin-bottom: 0
</style>
