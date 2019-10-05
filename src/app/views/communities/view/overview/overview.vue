<template>
	<section class="section fill-backdrop">
		<app-page-container xl order="right,main,left">
			<div slot="right" v-if="!Screen.isMobile">
				<div v-if="shouldShowKnownMembers">
					<h5 class="section-header">
						<translate
							:translate-n="knownMemberCount"
							:translate-params="{ count: membersYouKnowCount }"
							translate-plural="%{ count } members you know"
						>
							1 member you know
						</translate>
					</h5>
					<app-user-avatar-list :users="knownMembers" />
					<br />
				</div>

				<app-community-description :community="community" :is-editing="isEditing" />

				<template v-if="community.game">
					<br />
					<app-game-thumbnail :game="community.game" class="-community-game" />
				</template>

				<div v-if="shouldShowCollabSection" class="-mod-list">
					<div class="clearfix">
						<div class="pull-right" v-if="shouldShowLoadMoreCollaborators">
							<app-button
								trans
								:disabled="isLoadingMoreCollaborators"
								@click="toggleCollaboratorList"
							>
								<translate v-if="collaboratorListCollapsed || isLoadingMoreCollaborators || hasMoreCollaborators">View All</translate>
								<translate v-else>Show fewer</translate>
							</app-button>
						</div>

						<h5 class="section-header">
							<translate>Moderators</translate>
						</h5>
					</div>

					<div v-for="user of moderators" :key="user.id" class="-mod-list-entry">
						<app-user-card-hover :user="user">
							<router-link :to="user.url">
								<span>
									{{ user.display_name }}
									<span class="-mod-avatar-container">
										<img
											key="user"
											:src="user.img_avatar"
											class="img-responsive -mod-avatar-img"
											alt=""
										/>
										<app-jolticon class="-mod-verified" v-if="user.is_verified" icon="verified" />
									</span>
								</span>
							</router-link>
						</app-user-card-hover>
						<span v-if="owner && user.id === owner.id" class="text-muted small">
							<translate>owner</translate>
						</span>
					</div>
				</div>
			</div>

			<div slot="left">
				<!--
					We put some extra spacing in here because of the affixed header
					nav.
				-->
				<app-scroll-affix :scroll-offset="80" :disabled="!Screen.isLg">
					<app-communities-view-overview-nav
						class="-nav"
						:community="community"
						:channel="channel"
						:is-editing="isEditing"
					/>
				</app-scroll-affix>
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
@require '~styles-lib/mixins'

// Put some extra spacing in here because of the affixed game header.
.gj-scroll-affixed .-nav
	margin-top: $shell-top-nav-height + 10px !important

.-community-game
	margin-bottom: 0

.-mod-list-entry
	margin-bottom: ($line-height-computed / 4)

	&> div
		display: inline-block !important

.-mod-avatar-container
	position: relative
	display: inline-block

.-mod-avatar-img
	display: inline
	height: 1.5em
	img-circle()

.-mod-verified
	position: absolute
	right: -4px
	bottom: -4px
	change-bg('bg-offset')
	border-radius: 100%
	font-size: 14px

.-mod-list
	margin-top: $line-height-computed

</style>

<script lang="ts" src="./overview"></script>
