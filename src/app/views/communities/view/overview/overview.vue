<template>
	<div>
		<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
			<div class="container text-center">
				<p>
					<b><translate>You've been invited to collaborate on this community.</translate></b>
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

		<app-page-header
			v-if="routeStore.isShowingSidebar && !!community.header"
			:cover-media-item="community.header"
		/>

		<app-communities-view-page-container>
			<template #default>
				<app-communities-view-feed :feed="feed" @add-post="onPostAdded" />
			</template>
			<template #sidebar v-if="!Screen.isMobile && sidebarData && channelPath === 'featured'">
				<app-community-sidebar :data="sidebarData" :community="community" />
			</template>
		</app-communities-view-page-container>
	</div>
</template>

<script lang="ts" src="./overview"></script>
