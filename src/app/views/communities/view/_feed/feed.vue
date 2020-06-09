<template>
	<div>
		<app-post-add-button
			v-if="shouldShowPostAdd"
			:community="community"
			:channel="channel"
			@add="onPostAdded"
			:placeholder="placeholderText"
		/>

		<app-nav-tab-list v-if="shouldShowTabs">
			<ul>
				<li>
					<router-link
						:to="{
							name: 'communities.view.channel',
							params: {
								channel: channel.title,
							},
						}"
						active-class="active"
						exact
					>
						<translate>New</translate>
					</router-link>
				</li>
				<li>
					<router-link
						:to="{
							name: 'communities.view.channel',
							params: {
								channel: channel.title,
							},
							query: {
								sort: 'hot',
							},
						}"
						active-class="active"
						exact
					>
						<translate>Hot</translate>
					</router-link>
				</li>
			</ul>
		</app-nav-tab-list>

		<app-expand v-if="shouldShowLoadNew" when animate-initial>
			<app-activity-feed-new-button @click="loadNew">
				<translate>Show New Posts</translate>
			</app-activity-feed-new-button>
		</app-expand>

		<app-activity-feed-placeholder v-if="!feed" />
		<template v-else>
			<app-activity-feed
				v-if="feed.hasItems"
				:feed="feed"
				show-ads
				@unfeature-post="onPostUnfeatured"
				@reject-post="onPostRejected"
				@move-channel-post="onPostMovedChannel"
			/>
			<div v-else-if="channel !== routeStore.frontpageChannel" class="alert">
				<div v-translate="{ message: noPostsMessage }">
					<b>There are no posts here yet.</b>
					What are you waiting for? %{ message } Make people happy.
				</div>
			</div>
			<div v-else class="alert">
				<div>
					<translate>There are no featured posts in this community.</translate>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts" src="./feed"></script>
