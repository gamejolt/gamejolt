<template>
	<div>
		<section class="-header" v-if="community.header && channel === 'featured'">
			<div class="container">
				<div class="sheet sheet-full sans-margin-bottom">
					<app-media-item-backdrop radius="lg" :media-item="community.header">
						<app-img-responsive :src="community.header.mediaserver_url" alt="" />
					</app-media-item-backdrop>
				</div>
			</div>
		</section>

		<!-- <section v-if="collaboratorInvite" class="section section-thin fill-highlight">
			<div class="container text-center">
				<p v-translate>
					<b>You've been invited to collaborate on this community.</b>
				</p>
				<app-button
					primary
					:disabled="!canAcceptCollaboration"
					v-app-tooltip.bottom="acceptCollaborationTooltip"
					@click="acceptCollaboration()"
				>
					<translate>Accept</translate>
				</app-button>
				<app-button trans @click="declineCollaboration()">
					<translate>Decline</translate>
				</app-button>
			</div>
		</section> -->

		<section class="section">
			<app-page-container no-left :no-right="channel !== 'featured'">
				<div slot="right" v-if="!Screen.isMobile && sidebarData && channel === 'featured'">
					<app-community-sidebar
						:is-editing="isEditing"
						:data="sidebarData"
						:community="community"
					/>
				</div>

				<!-- <div slot="left">

			</div> -->

				<div v-if="community.isBlocked" class="alert alert-notice">
					<app-jolticon icon="notice" />
					<span v-translate>
						<b>You have been blocked from this community.</b>
						<br />
						The reason for your block is as follows:
					</span>
					<br />

					<em>
						<strong>
							{{ communityBlockReason }}
						</strong>
					</em>

					<br />
					<br />

					<div>
						<translate>
							You are unable to create any new posts in this community until your block gets lifted
							or expires.
						</translate>
					</div>

					<div v-if="community.user_block && community.user_block.doesExpire">
						Your block will expire in
						<b><app-time-ago :date="community.user_block.expires_on" without-suffix/></b>
					</div>
				</div>

				<!-- If we are editing, we are showing the subroute's <edit> view here. Otherwise display feed stuff. -->
				<template v-if="isEditing">
					<router-view
						@details-change="onDetailsChanged"
						@channels-change="onChannelsChanged"
						@games-change="onGamesChanged"
					/>
				</template>
				<template v-else>
					<app-post-add-button
						v-if="shouldShowPostAdd"
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
							show-ads
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
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-header
	padding-top: 12px

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
