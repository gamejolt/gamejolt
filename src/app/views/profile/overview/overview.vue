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
		<section class="section" v-else>
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
									<external-link class="link-unstyled" :href="twitchAccount.platformLink">
										<app-jolticon :icon="twitchAccount.icon" />
										{{ twitchAccount.name }}
									</external-link>
								</div>
								<div v-if="mixerAccount">
									<external-link class="link-unstyled" :href="mixerAccount.platformLink">
										<app-jolticon :icon="mixerAccount.icon" />
										{{ mixerAccount.name }}
									</external-link>
								</div>
								<div v-if="twitterAccount">
									<external-link class="link-unstyled" :href="twitterAccount.platformLink">
										<app-jolticon :icon="twitterAccount.icon" />
										<span>@</span>
										{{ twitterAccount.name }}
									</external-link>
								</div>
								<div v-if="tumblrAccount">
									<external-link class="link-unstyled" :href="tumblrAccount.tumblrSelectedBlog.url">
										<app-jolticon :icon="tumblrAccount.icon" />
										{{ tumblrAccount.tumblrSelectedBlog.title }}
									</external-link>
								</div>
								<div v-if="googleAccount">
									<external-link class="link-unstyled" :href="googleAccount.platformLink">
										<app-jolticon :icon="googleAccount.icon" />
										{{ googleAccount.name }}
									</external-link>
								</div>
							</template>
							<div v-if="user.web_site">
								<external-link class="link-unstyled" :href="user.web_site">
									<app-jolticon icon="link" />
									<translate>Website</translate>
								</external-link>
							</div>
							<template v-if="youtubeChannels.length">
								<div v-for="channel of youtubeChannels" :key="channel.id">
									<external-link
										class="link-unstyled"
										:href="`https://www.youtube.com/channel/${channel.channel_id}`"
									>
										<app-jolticon icon="youtube" />
										{{ channel.title }}
									</external-link>
								</div>
							</template>

							<br />
						</template>

						<!-- Latest Games -->
						<template v-if="hasGamesSection">
							<br />
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

					<div class="-spacer visible-xs" />

					<router-view />
				</app-page-container>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-spacer
	spacer()
</style>

<script lang="ts" src="./overview"></script>
