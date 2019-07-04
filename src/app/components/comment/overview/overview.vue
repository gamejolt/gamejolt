<template>
	<div class="comment-overview">
		<!--
			Capture the click and prevent default so that no links within the content open up.
		-->
		<div
			class="-comment fill-offset"
			v-for="comment of comments"
			:key="comment.id"
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
				<app-user-verified-tick :user="comment.user" />
				<small class="text-muted">@{{ comment.user.username }}</small>
			</div>
			<app-fade-collapse :collapse-height="120">
				<div class="-content">
					<app-content-viewer :source="comment.comment_content" />
				</div>
			</app-fade-collapse>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-comment
	rounded-corners()
	theme-prop('border-color', 'bg-offset')
	padding: 10px
	border-width: 2px
	border-style: solid
	margin-bottom: 4px

	&:hover
		theme-prop('border-color', 'link')
		cursor: pointer

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
