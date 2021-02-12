<script lang="ts" src="./details"></script>

<template>
	<div>
		<app-communities-view-page-container>
			<template #default>
				<app-alert-dismissable
					v-if="isOwner"
					alert-type="info"
					:dismiss-key="`community-${community.id}.welcome-msg`"
				>
					<h2 class="section-header">
						<translate>Welcome to your new community! 🎉</translate>
					</h2>

					<ul>
						<li>
							<p>
								<strong><translate>Your community is live!</translate></strong>
								<br />
								<translate>
									Users can already see and join your community on Game Jolt.
								</translate>
							</p>
						</li>

						<li>
							<strong><translate>Customize the %$@#! out of it</translate></strong>
							<br />
							<translate>
								You can edit every aspect of your community in this page. Set a
								description, upload a thumbnail and header, customize your channels
								- make it real pretty!
							</translate>
						</li>

						<li>
							<strong>
								<translate>Assign moderators and collaborators</translate>
							</strong>
							<br />
							<translate>
								Invite others to help you moderate and contribute to your community.
							</translate>
						</li>

						<li>
							<strong><translate>Get Featured</translate></strong>
							<br />
							<translate>
								Share your community with your friends, post about it on Reddit,
								Facebook, Twitter and Discord. Game Jolt staff will be looking for
								active communities to feature on the home page.
							</translate>
						</li>
					</ul>
				</app-alert-dismissable>

				<!-- Details -->
				<app-community-perms :community="community" required="community-details">
					<h2 class="section-header">
						<translate>Details</translate>
					</h2>

					<form-community :model="community" @submit="onDetailsChange" />
					<div class="-spacer" />

					<template v-if="routeStore.canEditDescription && Screen.isMobile">
						<h2 class="section-header">
							<translate>Edit Description</translate>
						</h2>

						<form-community-description :model="community" />
						<div class="-spacer" />
					</template>
				</app-community-perms>

				<!-- Leave/Remove Community -->
				<div class="-danger-zone well fill-offset">
					<template v-if="isOwner">
						<h2>
							<translate>Remove Community</translate>
						</h2>

						<div class="page-help">
							<p v-translate>
								Removing your community will remove it from the site completely.
								<b>This is permanent!</b>
							</p>
						</div>

						<app-button @click="removeCommunity()">
							<translate>Remove Community</translate>
						</app-button>
					</template>
					<template v-else>
						<h2>
							<translate>Leave Community</translate>
						</h2>

						<div class="page-help">
							<p>
								<translate>
									You are currently a moderator on this community. Leaving the
									community will revoke all of your moderation permissions.
								</translate>
							</p>
						</div>

						<app-button @click="leaveCommunity()">
							<translate>Leave Community</translate>
						</app-button>
					</template>
				</div>
			</template>

			<template v-if="routeStore.canEditDescription && !Screen.isMobile" #sidebar>
				<h2 class="section-header">
					<translate>Edit Description</translate>
				</h2>

				<form-community-description :model="community" />
			</template>
		</app-communities-view-page-container>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-spacer
	margin-top: $line-height-computed

	@media $media-sm-up
		margin-top: $line-height-computed * 2

.-danger-zone
	h2:first-of-type
		margin-top: 0
</style>
