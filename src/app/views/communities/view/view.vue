<template>
	<div v-if="community">
		<app-scroll-scroller
			v-if="routeStore.isShowingSidebar"
			thin
			class="-channel-sidebar fill-offset"
		>
			<div class="-card">
				<app-communities-view-card :community="community" />
			</div>

			<app-nav-channels v-if="!isEditing" />
			<app-nav-edit v-else />
		</app-scroll-scroller>

		<div class="-content fill-backdrop">
			<template v-if="!routeStore.isShowingSidebar">
				<app-page-header :cover-media-item="community.header">
					<h1>
						<router-link :to="{ name: 'communities.view.overview' }">
							{{ community.name }}
						</router-link>
						<app-community-verified-tick :community="community" big />
					</h1>

					<template #spotlight>
						<router-link :to="{ name: 'communities.view.overview' }" slot="spotlight">
							<app-community-thumbnail-img :community="community" />
						</router-link>
					</template>

					<template #nav>
						<nav class="platform-list inline">
							<ul>
								<li>
									<router-link
										:to="{ name: 'communities.view.overview' }"
										:class="{ active: $route.name === 'communities.view.overview' }"
									>
										<translate>Overview</translate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'communities.view.members' }" active-class="active">
										<translate>Members</translate>
										<span class="badge" v-if="community.member_count">
											{{ community.member_count | number }}
										</span>
									</router-link>
								</li>
								<li v-if="Screen.isMobile && routeStore.sidebarData">
									<a @click="onClickAbout">
										<translate>About</translate>
									</a>
								</li>

								<li>
									<app-popper popover-class="fill-darkest">
										<a>
											<app-jolticon icon="ellipsis-v" />
										</a>

										<div slot="popover" class="list-group list-group-dark">
											<a
												class="list-group-item has-icon"
												@click="copyShareUrl"
												v-app-track-event="`copy-link:community`"
											>
												<app-jolticon icon="link" />
												<translate>Copy link to community</translate>
											</a>
											<a
												v-if="shouldShowModTools"
												class="list-group-item has-icon"
												:href="Environment.baseUrl + `/moderate/communities/view/${community.id}`"
												target="_blank"
											>
												<app-jolticon icon="cog" />
												<span>Moderate Community</span>
											</a>
										</div>
									</app-popper>
								</li>
							</ul>
						</nav>
					</template>

					<template #controls v-if="!community.isBlocked">
						<template v-if="community.hasPerms()">
							<app-community-perms :community="community">
								<app-button v-if="!isEditing" primary block :to="community.routeEditLocation">
									<app-jolticon icon="edit" class="middle" />
									<translate>Edit Community</translate>
								</app-button>
								<app-button
									v-else
									primary
									block
									:to="{
										name: 'communities.view.overview',
										params: {
											path: community.path,
										},
									}"
								>
									<translate>View Community</translate>
								</app-button>
							</app-community-perms>
						</template>
						<app-community-join-widget
							v-else
							:community="community"
							@join="onJoin"
							@leave="onLeave"
							block
						/>
					</template>
				</app-page-header>

				<app-nav-channels-inline v-if="!isEditing" />
				<app-nav-edit v-else />
			</template>

			<router-view />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require './variables'

.-channel-sidebar
	position: fixed
	top: $shell-top-nav-height
	bottom: 0
	width: $sidebar-width
	padding: $sidebar-padding

	#shell.has-cbar &
		left: $shell-cbar-width

	#shell.has-banner &
		top: $shell-top-nav-height * 2

	// Prevent shifting when v-if="Screen.isSize" removes the element.
	@media $media-md-down
		display: none

.-content
	// Make it full-size height at least, so that the footer doesn't cut things off weird.
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

	@media $media-lg
		padding-left: $sidebar-width
</style>

<script lang="ts" src="./view"></script>
