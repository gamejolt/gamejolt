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
		<app-scroll-inview @inview="onInviewChange(true)" @outview="onInviewChange(false)">
			<a
				class="forum-post-replied-to-button"
				v-if="!isReply && post.parent_post_id"
				@click="loadParentPost"
			>
				<app-jolticon class="middle" :icon="'chevron-' + (!showingParent ? 'right' : 'down')" />
				<span v-translate="{ user: post.replied_to.display_name }">
					In response to
					<b>%{ user }</b>
				</span>
				<small>@{{ post.replied_to.username }}</small>
			</a>

			<app-expand :when="showingParent">
				<div v-if="parent" class="forum-post-body forum-post-body-quoted">
					<app-widget-compiler :content="parent.content_compiled" />
				</div>
				<p v-else>
					<strong><translate>Post removed.</translate></strong>
				</p>
				<hr />
			</app-expand>

			<div v-if="!isEditing" class="forum-post-body">
				<app-widget-compiler :content="post.content_compiled" />
			</div>
			<template v-else>
				<form-forum-post :model="post" :topic="topic" @cancel="closeEdit" @submit="closeEdit" />

				<br />
			</template>

			<p class="text-muted small" v-if="post.modified_by">
				<translate>Last modified on</translate>
				<span :title="date(post.modified_on, 'medium')">
					{{ post.modified_on | date('longDate') }}
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

		<template slot="meta">
			<app-popper v-if="app.user">
				<a class="link-muted" v-app-tooltip="$gettext('Options')">
					<app-jolticon icon="ellipsis-v" class="middle" />
				</a>
				<div slot="popover" class="list-group list-group-dark">
					<a class="list-group-item has-icon" @click="copyPermalink">
						<app-jolticon icon="link" />
						<translate>Copy Link</translate>
					</a>

					<a
						class="list-group-item has-icon"
						v-if="app.user && post.user_id === app.user.id && !topic.is_locked && !isEditing"
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
							:href="Environment.baseUrl + `/moderate/forums/posts/edit/${post.id}`"
							target="_blank"
						>
							<translate>Edit (Mod)</translate>
						</a>
						<a
							class="list-group-item"
							:href="Environment.baseUrl + `/moderate/forums/posts/remove/${post.id}`"
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
			</app-popper>
		</template>

		<template v-if="!isReply" slot="controls">
			<app-button
				v-if="!topic.is_locked && app.user"
				circle
				icon="reply"
				v-app-tooltip="$gettext('Reply')"
				:disabled="isEditing"
				@click="reply"
			/>

			<app-button v-if="post.replies_count && !isEditing" type="a" trans @click="toggleReplies">
				<translate
					:translate-n="post.replies_count"
					:translate-params="{ count: post.replies_count }"
					translate-plural="%{ count } replies"
				>
					%{ count } reply
				</translate>
			</app-button>
		</template>

		<template v-if="isReplying || isShowingReplies" slot="replies">
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
@require '~styles/variables'
@require '~styles-lib/mixins'

.forum-post
	&-replied-to-button
		rounded-corners()
		theme-prop('background-color', 'bg-offset')
		theme-prop('color', 'fg')
		display: block
		margin-bottom: $line-height-computed
		padding: 5px 10px
		font-size: $font-size-small
</style>

<script lang="ts" src="./item" />
