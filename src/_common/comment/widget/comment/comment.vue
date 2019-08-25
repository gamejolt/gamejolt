<template>
	<app-message-thread-item
		:user="comment.user"
		:date="comment.posted_on"
		:is-showing-replies="shouldShowReplies"
		:is-reply="!!parent"
		:is-last="isLastInThread"
		:is-active="isActive"
	>
		<!--
			When scrolling an active comment into view, we don't want to target the
			top of the comment. We want to stop the scroll a bit higher in the
			viewport, so we hack this scroll target into the DOM and place it higher
			up than the comment itself.
		-->
		<div class="-scroll-target" ref="scrollTarget" />

		<template slot="tags" v-if="comment.is_pinned || isOwner || isCollaborator">
			<span v-if="comment.is_pinned" class="tag">
				<app-jolticon icon="thumbtack" />
				<translate>Pinned</translate>
			</span>

			<span class="tag" v-if="isOwner">
				<translate>Owner</translate>
			</span>
			<span class="tag" v-else-if="isCollaborator">
				<translate>Collaborator</translate>
			</span>
		</template>

		<template slot="meta">
			<app-popper v-if="user">
				<a class="link-muted" v-app-tooltip="$gettext('More Options')">
					<app-jolticon icon="ellipsis-v" class="middle" />
				</a>

				<div slot="popover" class="list-group list-group-dark">
					<a class="list-group-item has-icon" @click="copyPermalink">
						<app-jolticon icon="link" />
						<translate>Copy Link</translate>
					</a>
					<a class="list-group-item has-icon" v-if="canPin" @click="pinComment">
						<app-jolticon icon="thumbtack" />
						<translate v-if="comment.is_pinned">Unpin Comment</translate>
						<translate v-else>Pin Comment</translate>
					</a>
					<a class="list-group-item has-icon" v-if="user.id === comment.user.id" @click="startEdit">
						<app-jolticon icon="edit" />
						<translate>Edit Comment</translate>
					</a>
					<a
						class="list-group-item has-icon"
						v-if="canFollow"
						@click="onFollowClick"
						v-app-tooltip.left="
							comment.subscription
								? $gettext(`You're following this comment thread and will be notified of replies.`)
								: $gettext(`Get notifications when people post new replies to this thread.`)
						"
						v-app-track-event="`comment-widget:follow-click`"
					>
						<app-jolticon icon="subscribe" />
						<translate v-if="comment.subscription">
							Following
						</translate>
						<translate v-else>
							Follow Thread
						</translate>
					</a>
					<a class="list-group-item has-icon" v-if="canRemove" @click="removeComment">
						<app-jolticon icon="remove" notice />
						<translate>Remove Comment</translate>
					</a>
					<a class="list-group-item has-icon" v-if="user.id !== comment.user.id" @click="report">
						<app-jolticon icon="flag" notice />
						<translate>Report Comment</translate>
					</a>
					<a
						class="list-group-item has-icon"
						v-if="user.permission_level >= 3"
						:href="`${Environment.baseUrl}/moderate/comments/remove/${comment.id}`"
						target="_blank"
					>
						<app-jolticon icon="remove" notice />
						<template
							v-if="
								user.id === comment.user.id ||
									(widget.resourceOwner && widget.resourceOwner.id === user.id)
							"
						>
							<translate>Remove Comment (Moderate)</translate>
						</template>
						<template v-else>
							<translate>Remove Comment</translate>
						</template>
					</a>
				</div>
			</app-popper>
		</template>

		<template v-if="!isEditing">
			<app-comment-content :comment="comment" :content="comment.comment_content" />

			<app-comment-controls
				slot="controls"
				:comment="comment"
				:children="children"
				:show-reply="!parent && !showChildren"
			/>
		</template>
		<template v-else>
			<form-comment
				:model="comment"
				@submit="onCommentEdit"
				@cancel="isEditing = false"
				:resource="comment.resource"
			/>
		</template>

		<!-- Child Comments -->
		<template v-if="shouldShowReplies" slot="replies">
			<app-comment-widget-comment
				v-for="(child, i) of children"
				:key="child.id"
				:resource="resource"
				:resource-id="resourceId"
				:comment="child"
				:parent="comment"
				:is-last-in-thread="i === children.length - 1"
			/>
		</template>
	</app-message-thread-item>
</template>

<style lang="stylus" scoped>
.-scroll-target
	position: absolute
	top: -100px
</style>

<script lang="ts" src="./comment"></script>
