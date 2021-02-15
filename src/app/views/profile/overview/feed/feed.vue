<script lang="ts" src="./feed"></script>

<template>
	<div>
		<!-- Spawn day -->
		<app-user-spawn-day :user="user" @post-add="onPostAdded" />

		<template v-if="isOwner">
			<app-post-add-button @add="onPostAdded" />

			<app-nav-tab-list>
				<ul>
					<li>
						<router-link
							:to="{
								name: 'profile.overview',
								query: {},
							}"
							active-class="active"
							exact
						>
							<translate>Posts</translate>
						</router-link>
					</li>
					<li>
						<router-link
							:to="{
								name: 'profile.overview',
								query: {},
								params: { feedSection: 'likes' },
							}"
							active-class="active"
							exact
						>
							<translate>Likes</translate>
						</router-link>
					</li>
					<li>
						<router-link
							:to="{
								name: 'profile.overview',
								query: {
									tab: 'draft',
								},
							}"
							active-class="active"
							exact
						>
							<translate>Draft Posts</translate>
						</router-link>
					</li>
					<li>
						<router-link
							:to="{
								name: 'profile.overview',
								query: {
									tab: 'scheduled',
								},
							}"
							active-class="active"
							exact
						>
							<translate>Scheduled Posts</translate>
						</router-link>
					</li>
				</ul>
			</app-nav-tab-list>
		</template>
		<template v-else-if="showLikedFeed">
			<app-nav-tab-list>
				<ul>
					<li>
						<router-link
							:to="{
								name: 'profile.overview',
								query: {},
							}"
							active-class="active"
							exact
						>
							<translate>Posts</translate>
						</router-link>
					</li>
					<li>
						<router-link
							:to="{
								name: 'profile.overview',
								query: {},
								params: { feedSection: 'likes' },
							}"
							active-class="active"
							exact
						>
							<translate>Likes</translate>
						</router-link>
					</li>
				</ul>
			</app-nav-tab-list>
		</template>

		<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
		<template v-else>
			<template v-if="feed.hasItems">
				<template v-if="isLikeFeedOwnerDisabled">
					<div class="alert">
						<p>
							<translate>
								You have disabled your liked posts feed, so only you can see this.
								To enable it, go to your profile settings and turn it back on.
							</translate>
						</p>

						<app-button :to="{ name: 'dash.account.edit' }">
							<translate>Edit Profile</translate>
						</app-button>
					</div>
				</template>

				<app-activity-feed
					:feed="feed"
					:show-ads="!isOwner"
					@edit-post="onPostEdited"
					@publish-post="onPostPublished"
					@remove-post="onPostRemoved"
				/>
			</template>
			<div v-else class="alert">
				<template v-if="isOwner">
					<translate v-if="isLikeFeed">You haven't liked anything yet.</translate>
					<translate v-else>You haven't posted anything yet.</translate>
				</template>
				<template v-else>
					<translate v-if="isLikeFeed">This user hasn't liked anything yet.</translate>
					<translate v-else>This user hasn't posted anything yet.</translate>
				</template>
			</div>
		</template>
	</div>
</template>
