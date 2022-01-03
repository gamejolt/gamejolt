<script lang="ts" src="./feed"></script>

<template>
	<div>
		<!-- Spawn day -->
		<app-user-spawn-day :user="user" @post-add="onPostAdded" />

		<app-post-add-button v-if="isOwner" @add="onPostAdded" />

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
				<li v-app-tooltip="likeFeedTooltip">
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
						<app-jolticon v-if="isLikeFeedDisabled" icon="subscribed" />
					</router-link>
				</li>
				<template v-if="isOwner">
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
				</template>
			</ul>
		</app-nav-tab-list>

		<app-illustration v-if="isLikeFeed && isLikeFeedDisabled && !isOwner" :src="illNoComments">
			<p>
				<translate> This user has made their liked posts private. </translate>
			</p>
		</app-illustration>
		<app-activity-feed-placeholder v-else-if="!feed || !feed.isBootstrapped" />
		<template v-else>
			<app-activity-feed
				v-if="feed.hasItems"
				:feed="feed"
				:show-ads="!isOwner"
				@edit-post="onPostEdited"
				@publish-post="onPostPublished"
				@remove-post="onPostRemoved"
			/>
			<app-illustration v-else :src="illNoComments">
				<p>
					<template v-if="isOwner">
						<translate v-if="isLikeFeed"> You haven't liked anything yet. </translate>
						<translate v-else> You haven't posted anything yet. </translate>
					</template>
					<template v-else>
						<translate v-if="isLikeFeed">
							This user hasn't liked anything yet.
						</translate>
						<translate v-else> This user hasn't posted anything yet. </translate>
					</template>
				</p>
			</app-illustration>
		</template>
	</div>
</template>
