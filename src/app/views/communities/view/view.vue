<template>
	<div v-if="community">
		<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
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
		</section>

		<!-- Blur the header to signify they can't edit it -->
		<app-page-header
			:cover-media-item="community.header"
			:cover-editable="isEditing && canEditMedia"
			should-affix-nav
			:blur-header="isEditing"
			@edit-cover="showEditHeader()"
		>
			<span slot="cover-edit-buttons">
				<translate v-if="!community.header">Upload Header</translate>
				<translate v-else>Change Header</translate>
			</span>

			<h1>
				<router-link :to="{ name: 'communities.view.overview' }">
					{{ community.name }}
				</router-link>
				<app-community-verified-tick :community="community" big />
			</h1>

			<app-editable-overlay
				v-if="isEditing && canEditMedia"
				slot="spotlight"
				class="-fill"
				@click="showEditAvatar()"
			>
				<translate slot="overlay">Change</translate>
				<app-community-thumbnail-img :community="community" />
			</app-editable-overlay>
			<router-link v-else :to="{ name: 'communities.view.overview' }" slot="spotlight">
				<app-community-thumbnail-img :community="community" />
			</router-link>

			<nav slot="nav" class="platform-list inline">
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
					<li v-if="Screen.isMobile && sidebarData">
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

			<div v-if="!community.isBlocked" slot="controls">
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
			</div>
		</app-page-header>

		<router-view :community="community" :is-editing="isEditing" :sidebar-data="sidebarData" />
	</div>
</template>

<style lang="stylus" scoped>
.-fill
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

</style>

<script lang="ts" src="./view"></script>
