<script lang="ts" src="./widget"></script>

<template>
	<div class="comment-widget">
		<div v-if="displayMode">
			<h4 v-if="displayMode" class="sans-margin-top">
				<translate
					v-if="displayMode === 'comments'"
					:translate-n="totalCommentsCount"
					:translate-params="{ count: number(totalCommentsCount) }"
					translate-plural="%{ count } comments"
				>
					1 comment
				</translate>
				<translate
					v-else
					:translate-n="totalCommentsCount"
					:translate-params="{ count: number(totalCommentsCount) }"
					translate-plural="%{ count } shouts"
				>
					1 shout
				</translate>
			</h4>
		</div>

		<app-loading v-if="!hasBootstrapped && !hasError" centered />
		<div v-else-if="hasError" class="alert alert-notice">
			<translate>Couldn't fetch comments.</translate>
		</div>
		<div v-else-if="hasBootstrapped">
			<template v-if="shouldShowAdd">
				<app-message-thread-add v-if="user" hide-message-split>
					<form-comment
						:comment-model="model"
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

			<div v-if="shouldShowTabs">
				<app-nav-tab-list>
					<ul>
						<li>
							<a
								v-app-track-event="`comment-widget:change-sort:hot`"
								:class="{ active: isSortHot }"
								@click="sortHot()"
							>
								<translate>Hot</translate>
							</a>
						</li>
						<li v-if="showTopSorting">
							<a
								v-app-track-event="`comment-widget:change-sort:top`"
								:class="{ active: isSortTop }"
								@click="sortTop()"
							>
								<translate>Top</translate>
							</a>
						</li>
						<li>
							<a
								v-app-track-event="`comment-widget:change-sort:new`"
								:class="{ active: isSortNew }"
								@click="sortNew()"
							>
								<translate>New</translate>
							</a>
						</li>
						<li>
							<a
								v-app-track-event="`comment-widget:change-sort:you`"
								:class="{ active: isSortYou }"
								@click="sortYou()"
							>
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
					:model="model"
					:comment="comment"
					:children="childComments[comment.id]"
					:children-count="childrenCounts[comment.id]"
					:show-children="isThreadView"
				/>
			</app-message-thread>

			<div v-if="shouldShowLoadMore" class="page-cut">
				<app-button v-app-track-event="`comment-widget:more`" trans @click="loadMore">
					<translate>Load More</translate>
				</app-button>
			</div>

			<app-loading v-if="isLoading" class="loading-centered" />
			<div v-else-if="shouldShowEmptyMessage">
				<app-illustration src="~img/ill/no-comments.svg">
					<p>
						<translate v-if="shouldShowAdd">
							Everyone else seems to be in sleep mode, why don't you start the
							conversation?
						</translate>
						<translate v-else> Everyone seems to be in sleep mode. </translate>
					</p>
				</app-illustration>
			</div>
		</div>
	</div>
</template>
