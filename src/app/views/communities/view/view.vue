<template>
	<app-shell-content-with-sidebar v-if="community">
		<template #sidebar>
			<div class="-card">
				<app-communities-view-card :community="community" overflow />
			</div>

			<app-nav-channels v-if="!isEditing" />
			<app-nav-edit v-else />
		</template>

		<template #default>
			<template v-if="!routeStore.isShowingSidebar">
				<app-page-header
					:cover-media-item="community.header"
					:cover-editable="routeStore.canEditMedia"
					@edit-cover="showEditHeader()"
				>
					<h1>
						<router-link :to="{ name: 'communities.view.overview' }">
							{{ community.name }}
						</router-link>
						<app-community-verified-tick :community="community" big />
					</h1>

					<template #spotlight>
						<app-editable-thumbnail />
					</template>

					<template #cover-edit-buttons>
						<translate v-if="!community.header">Upload Header</translate>
						<translate v-else>Change Header</translate>
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
						<app-page-header-controls>
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
							<app-community-join-widget v-else :community="community" block />
						</app-page-header-controls>
					</template>
				</app-page-header>

				<app-nav-channels-inline v-if="!isEditing" />
				<app-nav-edit v-else />
			</template>

			<router-view />
		</template>
	</app-shell-content-with-sidebar>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require '../../../components/community/channel/card/variables'

.-card
	width: $card-width
</style>

<script lang="ts" src="./view"></script>
