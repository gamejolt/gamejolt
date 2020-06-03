<template>
	<div>
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

		<app-page-header :cover-media-item="community.header">
			<!--  -->
			<!-- @edit-cover="showEditHeader()" -->
			<span slot="cover-edit-buttons">
				<translate v-if="!community.header">Upload Header</translate>
				<translate v-else>Change Header</translate>
			</span>

			<!-- <h1>
				<router-link :to="{ name: 'communities.view.overview' }">
					{{ community.name }}
				</router-link>
				<app-community-verified-tick :community="community" big />
			</h1> -->

			<!-- v-if="isEditing && canEditMedia" -->
			<!-- @click="showEditAvatar()" -->
			<!-- <app-editable-overlay slot="spotlight" v-if="false" class="-fill">
				<translate slot="overlay">Change</translate>
				<app-community-thumbnail-img :community="community" />
			</app-editable-overlay>
			<router-link v-else :to="{ name: 'communities.view.overview' }" slot="spotlight">
				<app-community-thumbnail-img :community="community" />
			</router-link> -->
		</app-page-header>

		<!-- <section v-if="collaboratorInvite" class="section section-thin fill-highlight">
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
		</section> -->

		<app-communities-view-page-container>
			<template #default>
				<div v-if="community.isBlocked" class="alert alert-notice">
					<app-jolticon icon="notice" />
					<span v-translate>
						<b>You have been blocked from this community.</b>
						<br />
						The reason for your block is as follows:
					</span>
					<br />

					<em>
						<strong>
							{{ communityBlockReason }}
						</strong>
					</em>

					<br />
					<br />

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
			<template #sidebar v-if="!Screen.isMobile && sidebarData && channel === 'featured'">
				<app-community-sidebar :data="sidebarData" :community="community" />
			</template>
		</app-communities-view-page-container>

		<!-- <div slot="right" >

				</div> -->

		<!-- If we are editing, we are showing the subroute's <edit> view here. Otherwise display feed stuff. -->
		<!-- <template v-if="isEditing">
					<router-view
						@details-change="onDetailsChanged"
						@channels-change="onChannelsChanged"
						@games-change="onGamesChanged"
					/>
				</template>
				<template v-else> </template> -->
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-header
	padding-top: 12px

// .-container
// 	display: flex
// 	justify-content: center

// .-content
// 	width: 650px

// .-sidebar
// 	// flex: 0 1
// 	width: 300px
// 	margin-left: $grid-gutter-width

.-mobile-info-btn
	margin-top: -10px
	margin-bottom: 10px

	&-img
		width: 24px
		margin-right: 10px
		display: inline-block
		border-radius: 50%
</style>

<script lang="ts" src="./overview"></script>
