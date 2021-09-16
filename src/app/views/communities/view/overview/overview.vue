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
				<app-fireside-badge-add v-if="canCreateFireside" :community="community" />

				<div v-if="previewFiresides.length > 0" class="-preview">
					<app-fireside-teaser
						v-for="fireside in displayablePreviewFiresides"
						:key="fireside.id"
						:fireside="fireside"
						:community="community"
						@eject="onFiresideEject"
					/>
				</div>

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

.-preview
	display: grid
	grid-template-columns: repeat(5, 1fr)
	grid-gap: $line-height-computed
	margin-bottom: $line-height-computed
</style>
