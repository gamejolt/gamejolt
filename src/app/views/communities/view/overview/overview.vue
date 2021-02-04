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
