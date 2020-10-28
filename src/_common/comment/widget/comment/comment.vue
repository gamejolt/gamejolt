<script lang="ts" src="./comment"></script>

<template>
	<app-message-thread-item
		:user="shouldBlock ? null : comment.user"
		:date="comment.posted_on"
		:is-showing-replies="shouldShowReplies"
		:is-reply="!!parent"
		:is-last="isLastInThread"
		:is-active="isActive"
		:is-blocked="shouldBlock"
	>
		<template v-if="comment.is_pinned || isOwner || isCollaborator" #tags>
			<span v-if="comment.is_pinned" class="tag">
				<app-jolticon icon="thumbtack" />
				<translate>Pinned</translate>
			</span>

			<span v-if="isOwner" class="tag">
				<translate>Owner</translate>
			</span>
			<span v-else-if="isCollaborator" class="tag">
				<translate>Collaborator</translate>
			</span>
		</template>

		<template #meta>
			<app-popper v-if="user" popover-class="fill-darkest">
				<a v-app-tooltip="$gettext('More Options')" class="link-muted">
					<app-jolticon icon="ellipsis-v" class="middle" />
				</a>

				<template #popover>
					<div class="list-group list-group-dark">
						<a class="list-group-item has-icon" @click="copyPermalink">
							<app-jolticon icon="link" />
							<translate>Copy Link</translate>
						</a>
						<a v-if="canPin" class="list-group-item has-icon" @click="pinComment">
							<app-jolticon icon="thumbtack" />
							<translate v-if="comment.is_pinned">Unpin Comment</translate>
							<translate v-else>Pin Comment</translate>
						</a>
						<a
							v-if="user.id === comment.user.id"
							class="list-group-item has-icon"
							@click="startEdit"
						>
							<app-jolticon icon="edit" />
							<translate>Edit Comment</translate>
						</a>
						<a
							v-if="canFollow"
							v-app-tooltip.left="
								comment.subscription
									? $gettext(
											`You're following this comment thread and will be notified of replies.`
									  )
									: $gettext(
											`Get notifications when people post new replies to this thread.`
									  )
							"
							v-app-track-event="`comment-widget:follow-click`"
							class="list-group-item has-icon"
							@click="onFollowClick"
						>
							<app-jolticon icon="subscribe" />
							<translate v-if="comment.subscription">
								Following
							</translate>
							<translate v-else>
								Follow Thread
							</translate>
						</a>
						<a v-if="canRemove" class="list-group-item has-icon" @click="removeComment">
							<app-jolticon icon="remove" notice />
							<translate>Remove Comment</translate>
						</a>
						<a
							v-if="user.id !== comment.user.id"
							class="list-group-item has-icon"
							@click="report"
						>
							<app-jolticon icon="flag" notice />
							<translate>Report Comment</translate>
						</a>
						<a
							v-if="user.permission_level >= 3"
							class="list-group-item has-icon"
							:href="`${Environment.baseUrl}/moderate/comments/remove/${comment.id}`"
							target="_blank"
						>
							<app-jolticon icon="remove" notice />
							<template v-if="canRemove">
								<translate>Remove Comment (Moderate)</translate>
							</template>
							<template v-else>
								<translate>Remove Comment</translate>
							</template>
						</a>
					</div>
				</template>
			</app-popper>
		</template>

		<template #default>
			<!--
			When scrolling an active comment into view, we don't want to target
			the top of the comment. We want to stop the scroll a bit higher in
			the viewport, so we hack this scroll target into the DOM and place
			it higher up than the comment itself.
			-->
			<div ref="scrollTarget" class="-scroll-target" />

			<template v-if="!isEditing">
				<app-comment-content :comment="comment" :content="comment.comment_content" />
			</template>
			<template v-else>
				<form-comment
					:model="comment"
					:comment-model="model"
					@submit="onCommentEdit"
					@cancel="isEditing = false"
				/>
			</template>
		</template>

		<template #controls>
			<app-comment-controls
				:comment="comment"
				:children="children"
				:parent="parent"
				:show-reply="!parent && !showChildren"
				:model="model"
			/>
		</template>

		<!-- Child Comments -->
		<template v-if="shouldShowReplies" #replies>
			<app-comment-widget-comment
				v-for="(child, i) of children"
				:key="child.id"
				:model="model"
				:comment="child"
				:parent="comment"
				:is-last-in-thread="i === children.length - 1"
			/>
		</template>

		<template v-if="shouldBlock" #blocked>
			<app-comment-widget-comment-blocked
				:comment="comment"
				:reason="blockReason"
				@show="onUnhideBlock"
			/>
		</template>
	</app-message-thread-item>
</template>

<style lang="stylus" scoped>
.-scroll-target
	position: absolute
	top: -100px
</style>
