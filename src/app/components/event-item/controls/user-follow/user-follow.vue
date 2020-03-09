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
				<a class="link-muted" @click.stop="emitClose()">
					<app-jolticon icon="remove" />
				</a>
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
		margin: 4px

	> button
		margin: 4px 12px 4px 4px

.-cancel
	padding: 28px 20px 0 0
	margin-bottom: auto

.-flex-auto
	flex: auto

.-flex-none
	flex: none
</style>
