<template>
	<div>
		<!--
			If this user is banned, we show very little.
		-->
		<section class="section fill-notice" v-if="!user.status">
			<div class="container">
				<p>
					<translate>profile.banned_message_html</translate>
				</p>

				<app-expand :when="isFriend">
					<p>
						<strong><translate>This user was your friend.</translate></strong>
						<br />
						<translate>
							If you remove them from your friends list, you will no longer be able to access your
							chat history with them.
						</translate>
					</p>

					<app-button solid @click="removeFriend()">
						<translate>profile.remove_friend_button</translate>
					</app-button>
				</app-expand>
			</div>
		</section>
		<section class="section fill-backdrop" v-else>
			<div>
				<app-page-container xl order="left,main,right">
					<div slot="left">
						<!-- Bio -->
						<div v-if="!isOverviewLoaded">
							<span class="lazy-placeholder" />
							<span class="lazy-placeholder" />
							<span class="lazy-placeholder" />
							<span class="lazy-placeholder" style="width: 40%" />
						</div>
						<div v-else-if="!user.hasBio" class="text-muted">
							<p>
								<em>
									<translate>
										This person doesn't have a bio yet, so use your imagination!
									</translate>
								</em>
							</p>
						</div>
						<div v-else>
							<!--
								Set a :key to let vue know that it should update
								this when the user changes.
							-->
							<app-fade-collapse
								:collapse-height="200"
								:is-open="showFullDescription"
								:animate="false"
								:key="user.bio_content"
								@require-change="canToggleDescription = $event"
								@expand="showFullDescription = true"
							>
								<app-content-viewer :source="user.bio_content" />
							</app-fade-collapse>

							<p>
								<a
									class="hidden-text-expander"
									v-if="canToggleDescription"
									@click="showFullDescription = !showFullDescription"
								/>
							</p>
						</div>
					</div>

					<div slot="left-bottom">
						<!-- Shouts -->
						<br />
						<template v-if="shouldShowShouts">
							<div class="pull-right">
								<app-button trans @click="showComments()">
									<translate>View All</translate>
								</app-button>
							</div>

							<h4 class="section-header">
								<translate>Shouts</translate>
								<small v-if="commentsCount">({{ commentsCount | number }})</small>
							</h4>

							<app-comment-add-button
								resource="User"
								:resource-id="user.id"
								:placeholder="addCommentPlaceholder"
								display-mode="shouts"
							/>

							<app-comment-overview
								:comments="overviewComments"
								resource="User"
								:resource-id="user.id"
								displayMode="shouts"
								@reload-comments="reloadPreviewComments"
							/>
						</template>
					</div>

					<div slot="right">
						<app-user-known-followers
							v-if="shouldShowKnownFollowers"
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>

						<template v-if="hasQuickButtonsSection">
							<!-- Add Friend -->
							<app-button v-if="canAddAsFriend" block @click="sendFriendRequest()">
								<translate>profile.friend_request_button</translate>
							</app-button>
							<app-button v-else-if="canMessage" block icon="user-messages" @click="openMessaging">
								<translate>Message</translate>
							</app-button>

							<template v-if="Screen.isMobile">
								<app-button
									v-if="gamesCount > 0"
									block
									:to="{
										name: 'library.collection.developer',
										params: { id: user.username },
									}"
								>
									{{ gamesCount | number }} Games
								</app-button>

								<app-button v-if="videosCount > 0" block :to="{ name: 'profile.videos' }">
									{{ videosCount | number }} Videos
								</app-button>
							</template>

							<br />
						</template>

						<!-- Social links -->
						<template v-if="hasLinksSection">
							<template v-if="linkedAccounts.length">
								<div v-if="twitchAccount">
									<app-link-external class="link-unstyled" :href="twitchAccount.platformLink">
										<app-jolticon :icon="twitchAccount.icon" />
										{{ twitchAccount.name }}
									</app-link-external>
								</div>
								<div v-if="mixerAccount">
									<app-link-external class="link-unstyled" :href="mixerAccount.platformLink">
										<app-jolticon :icon="mixerAccount.icon" />
										{{ mixerAccount.name }}
									</app-link-external>
								</div>
								<div v-if="twitterAccount">
									<app-link-external class="link-unstyled" :href="twitterAccount.platformLink">
										<app-jolticon :icon="twitterAccount.icon" />
										<span>@</span>
										{{ twitterAccount.name }}
									</app-link-external>
								</div>
								<div v-if="tumblrAccount">
									<app-link-external
										class="link-unstyled"
										:href="tumblrAccount.tumblrSelectedBlog.url"
									>
										<app-jolticon :icon="tumblrAccount.icon" />
										{{ tumblrAccount.tumblrSelectedBlog.title }}
									</app-link-external>
								</div>
								<div v-if="googleAccount">
									<app-link-external class="link-unstyled" :href="googleAccount.platformLink">
										<app-jolticon :icon="googleAccount.icon" />
										{{ googleAccount.name }}
									</app-link-external>
								</div>
							</template>
							<div v-if="user.web_site">
								<app-link-external class="link-unstyled" :href="user.web_site">
									<app-jolticon icon="link" />
									<translate>Website</translate>
								</app-link-external>
							</div>
							<template v-if="youtubeChannels.length">
								<div v-for="channel of youtubeChannels" :key="channel.id">
									<app-link-external
										class="link-unstyled"
										:href="`https://www.youtube.com/channel/${channel.channel_id}`"
									>
										<app-jolticon icon="youtube" />
										{{ channel.title }}
									</app-link-external>
								</div>
							</template>

							<br />
							<br />
						</template>

						<!-- Communities -->
						<template v-if="hasCommunitiesSection">
							<div class="clearfix">
								<div class="pull-right" v-if="canShowMoreCommunities">
									<app-button
										trans
										:disabled="isLoadingAllCommunities"
										@click="toggleShowAllCommunities"
									>
										<translate>View All</translate>
										<small>({{ communitiesCount | number }})</small>
									</app-button>
								</div>

								<h4 class="section-header">
									<translate>Communities</translate>
								</h4>
							</div>

							<span class="-communities">
								<template v-if="!isOverviewLoaded || isLoadingAllCommunities">
									<div
										v-for="i in previewCommunityCount"
										:key="i"
										class="-community-item -community-thumb-placeholder"
									></div>
								</template>
								<template v-else>
									<router-link
										v-for="community of shownCommunities"
										:key="community.id"
										class="-community-item link-unstyled"
										:to="{
											name: 'communities.view.overview',
											params: { path: community.path },
										}"
										v-app-tooltip.bottom="community.name"
									>
										<app-community-thumbnail-img class="-community-thumb" :community="community" />
										<app-community-verified-tick
											class="-community-verified-tick"
											:community="community"
											no-tooltip
										/>
									</router-link>
								</template>
							</span>

							<br />
						</template>

						<!-- Latest Games -->
						<template v-if="hasGamesSection">
							<div class="clearfix">
								<div class="pull-right">
									<app-button
										trans
										:to="{
											name: 'library.collection.developer',
											params: { id: user.username },
										}"
									>
										<translate>View All</translate>
										<small>({{ gamesCount | number }})</small>
									</app-button>
								</div>

								<h4 class="section-header">
									<translate>Latest Games</translate>
								</h4>
							</div>

							<app-game-list-placeholder v-if="!isOverviewLoaded" :num="7" />
							<app-game-list v-else-if="games.length" :games="games" event-label="profile" />
						</template>
					</div>

					<!-- Friend Requests -->
					<template v-if="userFriendship">
						<app-expand
							:when="userFriendship.state === UserFriendship.STATE_REQUEST_SENT"
							:animate-initial="true"
						>
							<div class="alert">
								<p>
									<translate
										:translate-params="{ username: '@' + userFriendship.target_user.username }"
									>
										Friend request to %{ username } pending acceptance.
									</translate>
								</p>
								<app-button @click="cancelFriendRequest()">
									<translate>profile.friend_request_cancel</translate>
								</app-button>
							</div>
						</app-expand>

						<app-expand
							:when="userFriendship.state === UserFriendship.STATE_REQUEST_RECEIVED"
							:animate-initial="true"
						>
							<div class="alert">
								<p>
									<translate :translate-params="{ username: '@' + userFriendship.user.username }">
										%{ username } would like to be your friend.
									</translate>
								</p>
								<app-button primary solid @click="acceptFriendRequest()">
									<translate>profile.friend_request_accept</translate>
								</app-button>
								<app-button
									trans
									@click="rejectFriendRequest()"
									v-app-tooltip="$gettext('profile.friend_request_decline_tooltip')"
								>
									<translate>profile.friend_request_decline</translate>
								</app-button>
							</div>
						</app-expand>
					</template>

					<!-- Spawn day -->
					<app-user-spawn-day :user="user" />

					<router-view />
				</app-page-container>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-communities
	display: grid
	grid-template-columns: repeat(5, 55px)
	grid-gap: 5px 10px

.-community-item
	pressy()
	display: inline-block
	position: relative
	outline: 0
	width: 55px
	height: 55px

.-community-thumb
	img-circle()
	change-bg('dark')
	position: absolute
	width: 100%
	height: 100%

	>>> img
		width: calc(100% - 2px)
		height: calc(100% - 2px)

.-community-thumb-placeholder
	img-circle()
	change-bg('bg-subtle')

.-community-verified-tick
	position: absolute
	right: -3px
	bottom: -1px
	change-bg('bg-offset')
	border-radius: 50%
</style>

<script lang="ts" src="./overview"></script>
