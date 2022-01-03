<script lang="ts" src="./feed"></script>

<template>
	<div>
		<app-blocked-notice :community="community" />

		<app-post-add-button
			v-if="shouldShowPostAdd"
			:community="community"
			:channel="channel"
			:placeholder="placeholderText"
			@add="emitAddPost"
		/>

		<app-nav-tab-list v-if="shouldShowTabs">
			<ul>
				<li>
					<router-link
						v-app-track-event="`communities-feed:change-sort:new`"
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
						v-app-track-event="`communities-feed:change-sort:hot`"
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

		<app-activity-feed-placeholder v-if="!feed" />
		<template v-else>
			<app-activity-feed
				v-if="feed.hasItems"
				:feed="feed"
				show-ads
				@unfeature-post="onPostUnfeatured"
				@reject-post="onPostRejected"
				@move-channel-post="onPostMovedChannel"
				@load-new="onLoadedNew"
			/>
			<div v-else-if="channel !== routeStore.frontpageChannel">
				<div v-if="channel.canPost" v-translate="{ message: noPostsMessage }" class="alert">
					<b>There are no posts here yet.</b>
					What are you waiting for? %{ message } Make people happy.
				</div>
				<div v-else-if="channel.is_archived">
					<app-illustration :src="illNoCommentsSmall">
						<p>
							<translate>Shhh. This channel is archived.</translate>
						</p>
					</app-illustration>
				</div>
				<div v-else v-translate class="alert">
					<translate>There are no posts in this channel.</translate>
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
