<script lang="ts" src="./item"></script>

<template>
	<app-message-thread-item
		:id="`forum-post-${id}`"
		:user="post.user"
		:replied-to="isReply ? post.replied_to : undefined"
		:date="post.posted_on"
		:is-active="isActive"
		:is-new="!!post.notification"
		:is-showing-replies="isReplying || isShowingReplies"
		:is-reply="isReply"
		:is-last="isLastInThread"
	>
		<app-scroll-inview
			:config="InviewConfig"
			@inview="onInviewChange(true)"
			@outview="onInviewChange(false)"
		>
			<a
				v-if="!isReply && post.parent_post_id && post.replied_to"
				class="forum-post-replied-to-button"
				@click="loadParentPost"
			>
				<app-jolticon
					class="middle"
					:icon="'chevron-' + (!showingParent ? 'right' : 'down')"
				/>
				<span v-translate="{ user: post.replied_to.display_name }">
					In response to
					<b>%{ user }</b>
				</span>
				<small>@{{ post.replied_to.username }}</small>
			</a>

			<app-expand :when="showingParent">
				<div v-if="parent" class="forum-post-content-quoted">
					<app-content-viewer :source="parent.text_content" />
				</div>
				<p v-else>
					<strong><translate>Post removed.</translate></strong>
				</p>
				<hr />
			</app-expand>

			<app-content-viewer v-if="!isEditing" :source="post.text_content" />
			<template v-else>
				<form-forum-post
					:model="post"
					:topic="topic"
					@cancel="closeEdit"
					@submit="closeEdit"
				/>

				<br />
			</template>

			<p v-if="post.modified_by_user && post.modified_on" class="text-muted small">
				<translate>Last modified on</translate>
				<span :title="date(post.modified_on, 'medium')">
					{{ date(post.modified_on, 'longDate') }}
				</span>
				<translate>by</translate>
				<router-link
					class="link-unstyled"
					:to="{
						name: 'profile.overview',
						params: { username: post.modified_by_user.username },
					}"
				>
					<strong>
						{{ post.modified_by_user.display_name }}
					</strong>
				</router-link>
				<small>@{{ post.modified_by_user.username }}</small>
			</p>
		</app-scroll-inview>

		<template #meta>
			<app-popper v-if="app.user" popover-class="fill-darkest">
				<a v-app-tooltip="$gettext('Options')" class="link-muted">
					<app-jolticon icon="ellipsis-v" class="middle" />
				</a>

				<template #popover>
					<div class="list-group list-group-dark">
						<a class="list-group-item has-icon" @click="copyPermalink">
							<app-jolticon icon="link" />
							<translate>Copy Link</translate>
						</a>

						<a
							v-if="
								app.user &&
								post.user_id === app.user.id &&
								!topic.is_locked &&
								!isEditing
							"
							class="list-group-item has-icon"
							@click="edit()"
						>
							<app-jolticon icon="edit" />
							<translate>Edit Post</translate>
						</a>
						<a class="list-group-item has-icon" @click="report">
							<app-jolticon icon="flag" notice />
							<translate>Report Post</translate>
						</a>
						<template v-if="app.user.permission_level > 0">
							<a
								class="list-group-item"
								:href="
									Environment.baseUrl + `/moderate/forums/posts/edit/${post.id}`
								"
								target="_blank"
							>
								<translate>Edit (Mod)</translate>
							</a>
							<a
								class="list-group-item"
								:href="
									Environment.baseUrl + `/moderate/forums/posts/remove/${post.id}`
								"
								target="_blank"
							>
								<translate>Remove (Mod)</translate>
							</a>
							<a
								class="list-group-item"
								:href="Environment.baseUrl + `/moderate/users/view/${post.user_id}`"
								target="_blank"
							>
								<translate>Moderate User</translate>
							</a>
						</template>
					</div>
				</template>
			</app-popper>
		</template>

		<template v-if="!isReply" #controls>
			<app-button
				v-if="!topic.is_locked && app.user"
				v-app-tooltip="$gettext('Reply')"
				class="forum-post-reply-button"
				circle
				trans
				icon="reply"
				:disabled="isEditing"
				@click="reply"
			/>

			<app-button
				v-if="post.replies_count && !isEditing"
				type="a"
				trans
				@click="toggleReplies"
			>
				<translate
					:translate-n="post.replies_count"
					:translate-params="{ count: post.replies_count }"
					translate-plural="+ %{ count } replies"
				>
					+ %{ count } reply
				</translate>
			</app-button>
		</template>

		<template v-if="isReplying || isShowingReplies" #replies>
			<app-message-thread-add v-if="isReplying">
				<form-forum-post
					v-if="isReplying"
					:topic="topic"
					:reply-to="post"
					@cancel="closeReply"
					@submit="onReplied"
				/>
			</app-message-thread-add>

			<app-message-thread v-if="isShowingReplies && replies.length > 0">
				<app-forum-post-list-item
					v-for="(reply, i) of replies"
					:key="reply.id"
					:topic="topic"
					:post="reply"
					:is-reply="true"
					:is-last-in-thread="i === replies.length - 1"
				/>
			</app-message-thread>

			<template v-if="totalReplyCount - replies.length > 0">
				<br />
				<p>
					<translate
						:translate-n="totalReplyCount - replies.length"
						:translate-params="{
							count: number(totalReplyCount - replies.length),
						}"
						translate-plural="+%{ count } more hidden"
					>
						+%{ count } more hidden
					</translate>
				</p>
			</template>
		</template>
	</app-message-thread-item>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.forum-post
	&-replied-to-button
		rounded-corners()
		change-bg('bg-offset')
		theme-prop('color', 'fg')
		display: block
		margin-bottom: $line-height-computed
		padding: 5px 10px
		font-size: $font-size-small

	&-reply-button
		margin-right: 8px
</style>
