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

				<template v-if="community.game">
					<p class="lead" v-translate="{ community: community.name }">
						Welcome to the
						<b>%{ community }</b>
						community on Game Jolt!
					</p>
					<app-game-thumbnail :game="community.game" class="-community-game" />
				</template>

				<template v-else>
					<p class="lead" v-translate="{ community: community.name }">
						Welcome to the
						<b>%{ community }</b>
						community on Game Jolt! Explore fan-created artwork, videos, game guides and more.
					</p>

					<p>
						<strong>
							<translate>Join the community and share your own creations for this game!</translate>
						</strong>
					</p>

					<p>
						<a
							href="https://gamejolt.com/games/gj/272864/devlog/communities-ps6r9d4p"
							class="link-help"
						>
							<translate>Learn more</translate>
						</a>
					</p>

					<br />
					<br />

					<div>
						<img class="img-responsive" src="./communities-mascot.svg" alt="" />
					</div>
				</template>
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
				<router-view @tags-change="onTagsChanged" />
			</template>
			<template v-else>
				<app-post-add-button
					:community="community"
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
								:class="{ active: sort === 'hot' }"
								block
							>
								<translate>Hot</translate>
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
										sort: 'new',
									},
								}"
								:class="{ active: sort === 'new' }"
								block
							>
								<translate>New</translate>
							</router-link>
						</li>
					</ul>
				</app-nav-tab-list>

				<app-expand v-if="shouldShowLoadNew" when animate-initial>
					<app-activity-feed-new-button @click="emitRefresh()">
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

.-community-game
	margin-bottom: 0

</style>

<script lang="ts" src="./overview"></script>
