<script lang="ts" src="./profile"></script>

<template>
	<div v-if="user">
		<!--
			If this user is banned, we show very little.
		-->
		<template v-if="!user.status">
			<app-page-header>
				<h1>
					{{ user.display_name }}
					<br />
					<small>@{{ user.username }}</small>
				</h1>

				<div class="text-muted small">
					<translate>profile.joined</translate>
					<app-time-ago :date="user.created_on" />
				</div>
			</app-page-header>

			<router-view />
		</template>
		<template v-else>
			<app-user-block-overlay :user="user">
				<app-page-header
					:cover-media-item="user.header_media_item"
					:cover-max-height="400"
					should-affix-nav
					:autoscroll-anchor-key="autoscrollAnchorKey"
				>
					<h1>
						<router-link
							:to="{
								name: 'profile.overview',
								params: { username: user.username },
							}"
						>
							{{ user.display_name }}
							<app-user-verified-tick :user="user" big />
							<small>@{{ user.username }}</small>
						</router-link>
					</h1>
					<div class="small text-muted">
						<!-- Joined on -->
						<translate>profile.joined</translate>
						<app-time-ago :date="user.created_on" />

						<template v-if="isRouteBootstrapped">
							<span class="dot-separator" />

							<!-- Dogtag -->
							<app-user-dogtag :type="user.dogtag" />

							<!-- Friend status -->
							<span
								v-if="
									userFriendship &&
									userFriendship.state === UserFriendship.STATE_FRIENDS
								"
								v-app-tooltip="$gettext('profile.friend_tooltip')"
								class="tag tag-highlight"
							>
								<translate>profile.friend_tag</translate>
							</span>

							<!-- Online status -->
							<template v-if="isOnline !== null">
								<span
									v-if="isOnline === false"
									v-app-tooltip="$gettext('profile.offline_tooltip')"
									class="tag"
								>
									<translate>profile.offline_tag</translate>
								</span>
								<span
									v-else
									v-app-tooltip="$gettext('profile.online_tooltip')"
									class="tag tag-highlight"
								>
									<translate>profile.online_tag</translate>
								</span>
							</template>

							<!-- Following status -->
							<span
								v-if="user.follows_you"
								v-app-tooltip="$gettext('This user is following you.')"
								class="tag tag-highlight"
							>
								<translate>Follows You</translate>
							</span>
						</template>
					</div>

					<template #spotlight>
						<app-user-avatar :user="user" />
					</template>

					<template #nav>
						<nav class="platform-list inline">
							<ul>
								<li>
									<router-link
										:to="{ name: 'profile.overview' }"
										:class="{ active: $route.name === 'profile.overview' }"
									>
										<translate>profile.overview_tab</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'profile.following' }"
										active-class="active"
									>
										<translate>Following</translate>
										<span class="badge">
											{{ user.following_count | number }}
										</span>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'profile.followers' }"
										active-class="active"
									>
										<translate>Followers</translate>
										<span class="badge">
											{{ user.follower_count | number }}
										</span>
									</router-link>
								</li>
								<!--
									We only need to show this on mobile.
								-->
								<li v-if="user.shouts_enabled && Screen.isMobile">
									<a @click="showComments()">
										<translate>Shouts</translate>
										<span class="badge">
											{{ commentsCount | number }}
										</span>
									</a>
								</li>
								<li>
									<router-link
										:to="{ name: 'profile.library' }"
										active-class="active"
									>
										<translate>profile.library_tab</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'profile.trophies' }"
										active-class="active"
									>
										<translate>Trophies</translate>
										<span class="badge">
											{{ trophyCount | number }}
										</span>
									</router-link>
								</li>
								<li>
									<app-popper popover-class="fill-darkest">
										<a>
											<app-jolticon icon="ellipsis-v" />
										</a>

										<div slot="popover" class="list-group list-group-dark">
											<a
												v-app-track-event="`copy-link:user`"
												class="list-group-item has-icon"
												@click="copyShareUrl"
											>
												<app-jolticon icon="link" />
												<translate>Copy link to user</translate>
											</a>
											<a
												v-if="app.user && user.id !== app.user.id"
												class="list-group-item has-icon"
												@click="report"
											>
												<app-jolticon icon="flag" />
												<translate>profile.report_user_button</translate>
											</a>
											<a
												v-if="
													userFriendship &&
													userFriendship.state ===
														UserFriendship.STATE_FRIENDS
												"
												class="list-group-item has-icon"
												@click="removeFriend()"
											>
												<app-jolticon icon="friend-remove-1" notice />
												<translate>profile.remove_friend_button</translate>
											</a>
											<a
												v-if="canBlock"
												class="list-group-item has-icon"
												@click="blockUser"
											>
												<app-jolticon icon="friend-remove-2" notice />
												<translate>Block user</translate>
											</a>
											<a
												v-if="app.user && app.user.permission_level > 0"
												class="list-group-item has-icon"
												:href="`${Environment.baseUrl}/moderate/users/view/${user.id}`"
												target="_blank"
											>
												<app-jolticon icon="cog" />
												<translate>profile.moderate_user_button</translate>
											</a>
										</div>
									</app-popper>
								</li>
							</ul>
						</nav>
					</template>

					<app-page-header-controls slot="controls">
						<app-user-follow-widget
							v-if="shouldShowFollow"
							:user="user"
							block
							location="profilePage"
						/>
						<app-button
							v-else-if="shouldShowEdit"
							primary
							block
							:to="{
								name: 'dash.account.edit',
							}"
						>
							<translate>Edit Profile</translate>
						</app-button>
					</app-page-header-controls>
				</app-page-header>

				<router-view />
			</app-user-block-overlay>
		</template>
	</div>
</template>
