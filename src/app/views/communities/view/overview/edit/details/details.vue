<template>
	<div>
		<!--
			Thumbnail
			This only shows here on mobile, on desktop the thumbnail can be edited through the
			spotlight slot in the page header.
		-->
		<template v-if="shouldShowThumbnail">
			<app-community-perms :community="community" required="community-media">
				<h2 class="section-header">
					<translate>Thumbnail</translate>
				</h2>

				<app-editable-overlay class="-edit-thumbnail" @click="showEditAvatar()">
					<translate slot="overlay">Change</translate>
					<app-community-thumbnail-img :community="community" />
				</app-editable-overlay>

				<div class="-spacer"></div>
			</app-community-perms>
		</template>

		<!-- Details - only makes sense to show for non game communities -->
		<app-community-perms v-if="!community.game" :community="community" required="community-details">
			<h2 class="section-header">
				<translate>Details</translate>
			</h2>

			<form-community :model="community" @submit="onDetailsChange" />

			<div class="-spacer"></div>
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
							You are currently a collaborator on this community. Leaving the community will revoke
							all of your moderation permissions.
						</translate>
					</p>
				</div>

				<app-button @click="leaveCommunity()">
					<translate>Leave Community</translate>
				</app-button>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-spacer
	margin-top: $line-height-computed

	@media $media-sm-up
		margin-top: $line-height-computed * 2

.-edit-thumbnail
	width: 120px
	border-radius: 50%
	overflow: hidden

.-danger-zone
	h2:first-of-type
		margin-top: 0
</style>

<script lang="ts" src="./details"></script>
