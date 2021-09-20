<script lang="ts" src="./overview"></script>

<template>
	<div>
		<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
			<div class="container text-center">
				<p>
					<b>
						<translate>You've been invited to collaborate on this community.</translate>
					</b>
				</p>
				<app-button
					v-app-tooltip.bottom="acceptCollaborationTooltip"
					solid
					:disabled="!canAcceptCollaboration"
					@click="acceptCollaboration()"
				>
					<translate>Accept</translate>
				</app-button>
				<app-button solid @click="declineCollaboration()">
					<translate>Decline</translate>
				</app-button>
			</div>
		</section>

		<app-communities-view-page-container>
			<template #default>
				<div v-if="displayablePreviewFiresides.length > 0 || community.allow_firesides">
					<div class="-firesides-header">
						<h4 class="section-header">
							<translate>Firesides</translate>
						</h4>

						<app-button
							trans
							:to="{
								name: 'communities.view.firesides',
								params: { path: community.path },
							}"
						>
							<translate>View All</translate>
						</app-button>
					</div>
				</div>

				<app-loading-fade :is-loading="!isRouteBootstrapped">
					<div
						v-if="displayablePreviewFiresides.length > 0 || canCreateFireside"
						class="-firesides-grid"
						:style="firesidesGridStyling"
					>
						<app-fireside-avatar-add v-if="canCreateFireside" :community="community" />

						<app-fireside-avatar
							v-for="fireside in displayablePreviewFiresides"
							:key="fireside.id"
							:fireside="fireside"
							hide-community
							@eject="onFiresideEject"
						/>
					</div>
				</app-loading-fade>

				<app-communities-view-feed
					:feed="feed"
					@add-post="onPostAdded"
					@load-new="loadedNew"
				/>
			</template>
			<template #sidebar>
				<app-community-sidebar :data="sidebarData" :community="community" />
			</template>
		</app-communities-view-page-container>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-firesides-grid
	display: grid
	grid-gap: $line-height-computed
	margin-bottom: $line-height-computed

.-firesides-header
	display: flex
	justify-content: space-between
</style>
