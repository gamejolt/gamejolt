<script lang="ts" src="./overview"></script>

<template>
	<div v-if="user">
		<!--
			If this user is banned, we show very little.
		-->
		<section v-if="!user.status" class="section fill-notice">
			<div class="container">
				<h2 class="-banned-header">
					<translate>profile.banned_message_html</translate>
				</h2>

				<app-expand :when="isFriend">
					<p>
						<strong><translate>This user was your friend.</translate></strong>
						<br />
						<translate>
							If you remove them from your friends list, you will no longer be able to
							access your chat history with them.
						</translate>
					</p>

					<app-button solid @click="removeFriend()">
						<translate>profile.remove_friend_button</translate>
					</app-button>
				</app-expand>

				<app-expand :when="user.is_following">
					<!-- Create some padding -->
					<template v-if="isFriend"><br /><br /></template>

					<p>
						<strong><translate>You were following this user.</translate></strong>
						<br />
						<translate>
							If you unfollow them now, you won't be able to follow them again.
						</translate>
					</p>

					<app-button solid @click="onClickUnfollow()">
						<translate>Unfollow</translate>
					</app-button>
				</app-expand>
			</div>
		</section>
		<section v-else class="section fill-backdrop">
			<div>
				<app-page-container xl order="left,main,right">
					<div slot="left">
						<!-- Bio -->
						<template v-if="!isOverviewLoaded">
							<div>
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" style="width: 40%" />
							</div>
							<br />
						</template>
						<template v-else-if="user.hasBio">
							<!--
								Set a :key to let vue know that it should update
								this when the user changes.
							-->
							<app-fade-collapse
								:key="user.bio_content"
								:collapse-height="200"
								:is-open="showFullDescription"
								:animate="false"
								@require-change="canToggleDescription = $event"
								@expand="showFullDescription = true"
							>
								<app-content-viewer :source="user.bio_content" />
							</app-fade-collapse>

							<p>
								<a
									v-if="canToggleDescription"
									class="hidden-text-expander"
									@click="showFullDescription = !showFullDescription"
								/>
							</p>
						</template>
					</div>

					<div slot="left-bottom">
						<!-- Shouts -->
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
								v-if="shouldShowShoutAdd"
								:model="user"
								:placeholder="addCommentPlaceholder"
								display-mode="shouts"
							/>

							<app-comment-overview
								:comments="overviewComments"
								:model="user"
								display-mode="shouts"
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
							<app-button
								v-else-if="canMessage"
								block
								icon="user-messages"
								@click="openMessaging"
							>
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
							</template>

							<br />
						</template>

						<!-- Social links -->
						<template v-if="hasLinksSection">
							<template v-if="linkedAccounts.length">
								<div v-if="twitchAccount">
									<app-link-external
										class="link-unstyled"
										:href="twitchAccount.platformLink"
									>
										<app-jolticon :icon="twitchAccount.icon" />
										{{ twitchAccount.name }}
									</app-link-external>
								</div>
								<div v-if="twitterAccount">
									<app-link-external
										class="link-unstyled"
										:href="twitterAccount.platformLink"
									>
										<app-jolticon :icon="twitterAccount.icon" />
										<span>@</span>
										{{ twitterAccount.name }}
									</app-link-external>
								</div>
								<div v-if="tumblrAccount && tumblrAccount.tumblrSelectedBlog">
									<app-link-external
										class="link-unstyled"
										:href="tumblrAccount.tumblrSelectedBlog.url"
									>
										<app-jolticon :icon="tumblrAccount.icon" />
										{{ tumblrAccount.tumblrSelectedBlog.title }}
									</app-link-external>
								</div>
							</template>
							<div v-if="user.web_site">
								<app-link-external class="link-unstyled" :href="user.web_site">
									<app-jolticon icon="link" />
									<translate>Website</translate>
								</app-link-external>
							</div>

							<br />
							<br />
						</template>

						<!-- Communities -->
						<template v-if="hasCommunitiesSection">
							<div class="clearfix">
								<div v-if="canShowMoreCommunities" class="pull-right">
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
									/>
								</template>
								<template v-else>
									<router-link
										v-for="community of shownCommunities"
										:key="community.id"
										v-app-tooltip.bottom="community.name"
										class="-community-item link-unstyled"
										:to="{
											name: 'communities.view.overview',
											params: { path: community.path },
										}"
									>
										<app-community-thumbnail-img
											class="-community-thumb"
											:community="community"
										/>
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
							<app-game-list
								v-else-if="games.length"
								:games="games"
								event-label="profile"
							/>
						</template>

						<!-- Trophies -->
						<template v-if="shouldShowTrophies">
							<h4 class="section-header">
								<translate>Trophies</translate>
							</h4>

							<div class="-trophies">
								<app-trophy-thumbnail
									class="-trophy"
									v-for="trophy of previewTrophies"
									:key="trophy.key"
									:trophy="trophy.trophy"
									no-difficulty
									no-highlight
									@click.native="onClickTrophy(trophy)"
								/>

								<router-link
									v-if="shouldShowMoreTrophies"
									class="-trophies-more -trophy link-unstyled"
									:to="{ name: 'profile.trophies' }"
									v-app-tooltip="$gettext(`View All Trophies...`)"
								>
									+{{ moreTrophyCount }}
								</router-link>
							</div>

							<br />
						</template>
					</div>

					<!-- User blocked -->
					<template v-if="userBlockedYou">
						<div class="alert">
							<p>
								<app-jolticon icon="notice" notice />
								<b><translate>This user blocked you.</translate></b>
								<translate>
									You are unable to shout at them or comment on their posts and
									games.
								</translate>
							</p>
						</div>
					</template>

					<!-- Friend Requests -->
					<template v-if="userFriendship">
						<app-expand
							:when="userFriendship.state === UserFriendship.STATE_REQUEST_SENT"
							:animate-initial="true"
						>
							<div class="alert">
								<p>
									<translate
										:translate-params="{
											username: '@' + userFriendship.target_user.username,
										}"
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
									<translate
										:translate-params="{
											username: '@' + userFriendship.user.username,
										}"
									>
										%{ username } would like to be your friend.
									</translate>
								</p>
								<app-button primary solid @click="onFriendRequestAccept">
									<translate>profile.friend_request_accept</translate>
								</app-button>
								<app-button
									v-app-tooltip="
										$gettext('profile.friend_request_decline_tooltip')
									"
									trans
									@click="onFriendRequestReject"
								>
									<translate>profile.friend_request_decline</translate>
								</app-button>
							</div>
						</app-expand>
					</template>

					<router-view />
				</app-page-container>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-banned-header
	margin-top: 0

.-communities
	display: grid
	grid-template-columns: repeat(5, minmax(55px, 1fr))
	grid-gap: 8px

.-community-item
	pressy()
	display: inline-block
	position: relative
	outline: 0
	width: 100%
	height: auto

.-community-thumb
	img-circle()
	change-bg('dark')
	width: 100%
	height: 100%

	>>> img
		width: calc(100% - 2px)
		height: calc(100% - 2px)

.-community-thumb-placeholder
	img-circle()
	change-bg('bg-subtle')
	// Setting 'padding-top' with a percentage goes off the elements width,
	// rather than the height. This will allow us to use a 1:1 aspect ratio
	// for the loading placeholders, matching them up with our thumbnails.
	padding-top: 100%

.-community-verified-tick
	position: absolute
	right: -3px
	bottom: -1px
	change-bg('bg-offset')
	border-radius: 50%

.-trophies
	display: grid
	grid-template-columns: repeat(5, 55px)
	grid-gap: 5px 10px

	&-more
		change-bg('bg-offset')
		rounded-corners-lg()
		display: flex !important
		justify-content: center
		align-items: center
		font-size: $font-size-h4
		user-select: none

		&:hover
			text-decoration: none

.-trophy
	width: 55px
	height: 55px
	pressy()
	display: inline-block
	position: relative
	cursor: pointer
</style>
