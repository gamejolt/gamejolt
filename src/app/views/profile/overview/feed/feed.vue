<template>
	<div>
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

		<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
		<template v-else>
			<app-activity-feed
				v-if="feed.hasItems"
				:feed="feed"
				:show-community-controls="feed.shouldShowCommunityControls"
				@edit-post="onPostEdited"
				@publish-post="onPostPublished"
				@remove-post="onPostRemoved"
			/>
			<div v-else class="alert">
				<translate>This user hasn't posted anything yet.</translate>
			</div>
		</template>
	</div>
</template>

<script lang="ts" src="./feed"></script>
