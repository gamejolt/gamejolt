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

		<app-page-header v-if="routeStore.isShowingSidebar" :cover-media-item="community.header" />

		<app-communities-view-page-container>
			<template #default>
				<div v-if="community.isBlocked" class="alert alert-notice">
					<p>
						<app-jolticon icon="notice" />
						<span>
							<b><translate>You have been blocked from this community.</translate></b>
							<br />
							<translate>The reason for your block is as follows:</translate>
						</span>
						<br />

						<em>
							<strong>
								{{ communityBlockReason }}
							</strong>
						</em>
					</p>

					<div>
						<translate>
							You are unable to create any new posts in this community until your block gets lifted
							or expires.
						</translate>
					</div>

					<div v-if="community.user_block && community.user_block.doesExpire">
						Your block will expire in
						<b><app-time-ago :date="community.user_block.expires_on" without-suffix/></b>
					</div>
				</div>

				<app-communities-view-feed :feed="feed" @add-post="onPostAdded" />
			</template>
			<template #sidebar v-if="!Screen.isMobile && sidebarData && channelPath === 'featured'">
				<app-community-sidebar :data="sidebarData" :community="community" />
			</template>
		</app-communities-view-page-container>
	</div>
</template>

<script lang="ts" src="./overview"></script>
