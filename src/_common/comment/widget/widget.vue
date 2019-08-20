<template>
	<div class="comment-widget">
		<app-loading v-if="!hasBootstrapped && !hasError" centered />
		<div v-else-if="hasError" class="alert alert-notice">
			<translate>Couldn't fetch comments.</translate>
		</div>
		<div v-else-if="hasBootstrapped">
			<template v-if="showAdd">
				<app-message-thread-add v-if="user" hide-message-split>
					<form-comment
						:resource="resource"
						:resource-id="resourceId"
						:autofocus="autofocus"
						@submit="_onCommentAdd"
					/>
				</app-message-thread-add>
				<div v-else class="alert">
					<p>
						You must be
						<a v-app-auth-required :href="loginUrl">logged in</a>
						to Game Jolt to post a comment.
					</p>
				</div>
			</template>

			<div v-if="showTabs">
				<app-nav-tab-list>
					<ul>
						<li>
							<a @click="sortHot()" :class="{ active: isSortHot }">
								<translate>Hot</translate>
							</a>
						</li>
						<li v-if="showTopSorting">
							<a @click="sortTop()" :class="{ active: isSortTop }">
								<translate>Top</translate>
							</a>
						</li>
						<li>
							<a @click="sortNew()" :class="{ active: isSortNew }">
								<translate>New</translate>
							</a>
						</li>
						<li>
							<a @click="sortYou()" :class="{ active: isSortYou }">
								<translate>You</translate>
							</a>
						</li>
					</ul>
				</app-nav-tab-list>
			</div>

			<app-message-thread>
				<app-comment-widget-comment
					v-for="comment of comments"
					:key="comment.id"
					:resource="resource"
					:resource-id="resourceId"
					:comment="comment"
					:children="childComments[comment.id]"
					:show-children="isThreadView"
				/>
			</app-message-thread>

			<div v-if="shouldShowLoadMore" class="page-cut">
				<app-button trans @click="loadMore" v-app-track-event="`comment-widget:more`">
					<translate>Load More</translate>
				</app-button>
			</div>

			<app-loading v-if="isLoading" class="loading-centered" />
			<div v-else-if="!comments.length">
				<div class="alert alert-info">
					<translate>It's feeling a bit empty in here. Start talking!</translate>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./widget"></script>
