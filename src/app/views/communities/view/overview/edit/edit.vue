<template>
	<div>
		<app-alert-dismissable
			v-if="isOwner"
			alert-type="info"
			:dismiss-key="`community-${community.id}.welcome-msg`"
		>
			<h2 class="section-header"><translate>Welcome to your new community! 🎉</translate></h2>

			<ul>
				<li>
					<p>
						<strong><translate>Your community is live!</translate></strong>
						<br />
						<translate>
							Users can already see your community on the site.
						</translate>
					</p>
				</li>

				<li>
					<strong><translate>Customize the %$@#! out of it</translate></strong>
					<br />
					<translate>
						You can edit every aspect of your community in this page. Set a description, upload a
						thumbnail and header, customize your channels - make it real pretty!
					</translate>
				</li>

				<li>
					<strong><translate>Keep it moderated</translate></strong>
					<br />
					<translate>
						Invite collaborators to help you moderate your community. This is your community. We
						won't intervene with how you choose to moderate it, as long as it isn't breaking our own
						site rules.
					</translate>
				</li>

				<li>
					<strong><translate>Whats next?</translate></strong>
					<br />
					<translate>
						Share the community with your friends, post about it on reddit, facebook, twitter,
						everywhere! An active community is a happy community. It's up to you to promote it.
					</translate>
				</li>
			</ul>
		</app-alert-dismissable>

		<template v-if="isOwner && !!community.game">
			<app-communities-overview-edit-notice :community="community" />
			<div class="-spacer"></div>
		</template>

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

		<!-- Channels -->
		<app-community-perms :community="community" required="community-channels">
			<h2 class="section-header">
				<translate>Channels</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Channels are used to group up posts by topic. They show on the left of the community
						page, and users can click them to filter which posts they see.
					</translate>
				</p>
				<p>
					<translate>
						Choosing good channels can help direct the conversation to the topics the community is
						about.
					</translate>
				</p>
			</div>

			<form-community-channel
				:community="community"
				@submit="onChannelAdded"
				:channels="community.channels"
			/>

			<ul class="-channel-list" v-if="community.channels">
				<draggable v-model="community.channels" @change="saveChannelSort">
					<li v-for="channel in community.channels" :key="channel.id">
						<a class="tag">
							{{ channel.title }}

							<a v-if="canRemoveChannel" @click.stop="onClickRemoveChannel(channel)">
								<app-jolticon icon="remove" v-app-tooltip="$gettext(`Remove Channel`)" />
							</a>
						</a>
					</li>
				</draggable>
			</ul>

			<div class="-spacer"></div>
		</app-community-perms>

		<!-- Collaborators -->
		<template v-if="isOwner">
			<h2 class="section-header">
				<translate>Collaborators</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Allow other users to manage your community by giving them collaborator roles.
					</translate>
				</p>
			</div>

			<app-card-list
				:items="collaborators"
				:active-item="activeCollaborator"
				:is-adding="isShowingCollaboratorAdd"
				@activate="activeCollaborator = $event"
			>
				<app-card-list-item
					v-for="collaborator of collaborators"
					:key="collaborator.id"
					:item="collaborator"
				>
					<a class="card-remove" @click.stop="removeCollaborator(collaborator)">
						<app-jolticon icon="remove" />
					</a>

					<div v-if="collaborator.user" class="card-title">
						<h5>{{ collaborator.user.username }}</h5>
					</div>

					<div class="card-meta">
						<span class="tag">
							<template v-if="collaborator.role === Collaborator.ROLE_EQUAL_COLLABORATOR">
								<translate>Collaborator</translate>
							</template>
							<template v-else-if="collaborator.role === Collaborator.ROLE_MODERATOR">
								<translate>Moderator</translate>
							</template>
							<template v-else>
								-
							</template>
						</span>

						<template v-if="collaborator.status !== Collaborator.STATUS_ACTIVE">
							<span class="tag"><translate>Invited</translate></span>
							<br />
							<translate>This user hasn't accepted their invitation yet.</translate>
						</template>
					</div>

					<template slot="body">
						<form-community-collaborator
							:model="collaborator"
							:community="community"
							@submit="onSavedCollaborator"
						/>
					</template>
				</app-card-list-item>

				<app-card-list-add
					:label="$gettext(`Add Collaborator`)"
					@toggle="isShowingCollaboratorAdd = !isShowingCollaboratorAdd"
				>
					<form-community-collaborator :community="community" @submit="onAddedCollaborator" />
				</app-card-list-add>
			</app-card-list>

			<div class="-spacer"></div>
		</template>

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
							all moderation permissions you have to it.
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

.-channel-list
	list-style: none
	padding-left: 0

	li
		margin-bottom: 10px

	.tag
		border-radius: 10px
		font-weight: normal
		cursor: move !important
		font-size: $font-size-base
		padding: 6px

.-danger-zone
	h2:first-of-type
		margin-top: 0
</style>

<script lang="ts" src="./edit"></script>
