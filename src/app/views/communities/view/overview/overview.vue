<template>
	<section class="section fill-backdrop">
		<app-page-container xl order="right,main,left">
			<div slot="right" v-if="!Screen.isMobile">
				<app-community-sidebar
					:community="community"
					:is-editing="isEditing"
					:owner="owner"
					:known-members="knownMembers"
					:known-member-count="knownMemberCount"
					:collaborators="collaborators"
					:collaborator-count="collaboratorCount"
					:initial-collaborator-count="initialCollaboratorCount"
				/>
			</div>

			<div slot="left">
				<!--
					We put some extra spacing in here because of the affixed header
					nav.
				-->
				<app-scroll-affix :scroll-offset="80" :disabled="!Screen.isLg">
					<app-communities-view-overview-nav
						v-if="!isEditing"
						class="-nav"
						:community="community"
						:channel="channel"
						:is-editing="isEditing"
					/>
					<app-communities-view-overview-nav-edit v-else class="-nav" :community="community" />
				</app-scroll-affix>

				<app-button v-if="Screen.isMobile" class="-mobile-info-btn" @click="onClickAbout" block>
					<app-community-thumbnail-img class="-mobile-info-btn-img" :community="community" />
					<translate>About this community</translate>
				</app-button>
			</div>

			<!-- If we are editing, we are showing the subroute's <edit> view here. Otherwise display feed stuff. -->
			<template v-if="isEditing">
				<router-view @details-change="onDetailsChanged" @channels-change="onChannelsChanged" />
			</template>
			<template v-else>
				<app-post-add-button
					:community="community"
					:channel="communityChannel"
					@add="onPostAdded"
					:placeholder="placeholderText"
				/>

				<app-nav-tab-list v-if="channel !== 'featured'">
					<ul>
						<li>
							<router-link
								:to="{
									name: 'communities.view.overview',
									params: {
										channel,
									},
								}"
								:class="{ active: sort === 'new' }"
								block
							>
								<translate>New</translate>
							</router-link>
						</li>
						<li>
							<router-link
								:to="{
									name: 'communities.view.overview',
									params: {
										channel,
									},
									query: {
										sort: 'hot',
									},
								}"
								:class="{ active: sort === 'hot' }"
								block
							>
								<translate>Hot</translate>
							</router-link>
						</li>
					</ul>
				</app-nav-tab-list>

				<app-expand v-if="shouldShowLoadNew" when animate-initial>
					<app-activity-feed-new-button @click="onClickLoadNew">
						<translate>Show New Posts</translate>
					</app-activity-feed-new-button>
				</app-expand>

				<app-activity-feed-placeholder v-if="!feed" />
				<template v-else>
					<app-activity-feed
						v-if="feed.hasItems"
						:feed="feed"
						@unfeature-post="onPostUnfeatured"
						@reject-post="onPostRejected"
						@move-channel-post="onPostMovedChannel"
					/>
					<div v-else-if="channel !== 'featured'" class="alert">
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
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

// Put some extra spacing in here because of the affixed game header.
.gj-scroll-affixed .-nav
	margin-top: $shell-top-nav-height + 10px !important

.-mobile-info-btn
	margin-top: -10px
	margin-bottom: 10px

	&-img
		width: 24px
		margin-right: 10px
		display: inline-block
		border-radius: 50%

</style>

<script lang="ts" src="./overview"></script>
