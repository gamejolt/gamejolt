<template>
	<div class="comment-overview sheet" v-if="comments.length > 0">
		<!--
			Capture the click and prevent default so that no links within the content open up.
		-->
		<div v-for="comment of comments" :key="comment.id" class="-comment-container">
			<div
				class="-comment"
				@click.capture="
					$event.preventDefault();
					open(comment);
				"
			>
				<div class="-byline">
					<div class="-avatar">
						<app-user-card-hover :user="comment.user">
							<app-user-avatar-img :user="comment.user" />
						</app-user-card-hover>
					</div>

					<strong>{{ comment.user.display_name }}</strong>
					<small class="text-muted">@{{ comment.user.username }}</small>
				</div>
				<app-fade-collapse :collapse-height="120">
					<div class="-content">
						<app-content-viewer :source="comment.comment_content" />
					</div>
				</app-fade-collapse>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.comment-overview .-comment-container:not(:last-child)
	border-bottom-width: 1px
	border-bottom-style: solid
	theme-prop('border-color', 'bg-subtle')

.-comment
	padding: 10px
	transition: background-color 0.085s ease
	rounded-corners()

	&:hover
		cursor: pointer
		theme-prop('background-color', 'bg-offset')

.-byline
	clearfix()
	margin-bottom: 10px
	line-height: 30px

.-avatar
	float: left
	margin-right: 10px
	width: 30px

.-content
	font-size: $font-size-small
</style>

<script lang="ts" src="./overview"></script>
