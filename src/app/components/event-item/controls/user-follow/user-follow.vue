<template>
	<app-expand :when="shouldShow" :animate-initial="false">
		<div class="-user-follow alert">
			<div class="-content">
				<p class="-flex-auto small">
					<translate>
						Would you also like to follow this user?
					</translate>
					<br />
					<translate>You will get notified when they post new stuff.</translate>
				</p>
				<app-user-follow-widget
					class="-flex-none"
					:sm="Screen.isXs"
					:user="post.user"
					event-label="fireside-post-like-widget"
				/>
			</div>
			<div class="-cancel">
				<app-button class="-cancel" circle trans icon="remove" @click="emitClose()" />
			</div>
		</div>
	</app-expand>
</template>

<script lang="ts" src="./user-follow"></script>

<style lang="stylus" scoped>
@require '~styles/variables'

.-user-follow
	display: flex
	margin-top: $grid-gutter-width * 0.5;
	margin-bottom: 0
	padding: 0

.-content
	display: flex
	flex-wrap: wrap
	align-items: center
	padding: 16px 0 16px 16px
	width: 100%

	> p
		margin: 4px 0

	> button
		margin: 4px 8px 4px 0

.-cancel
	margin: 20px 16px auto 8px

	button
		margin: 0

.-flex-auto
	flex: auto

.-flex-none
	flex: none
</style>
