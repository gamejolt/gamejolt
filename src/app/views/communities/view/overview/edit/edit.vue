<template>
	<div>
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

		<!-- Tags -->
		<app-community-perms :community="community" required="community-tags">
			<h2 class="section-header">
				<translate>Tags</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Tags are used to group up posts by topic. They show on the left of the community page,
						and users can click them to filter which posts they see.
					</translate>
				</p>
				<p>
					<translate>
						Choosing good tags can help direct the conversation to the topics the community is
						about.
					</translate>
				</p>
			</div>

			<form-community-tag :community="community" @submit="onTagAdded" :tags="community.tags" />

			<ul class="-tag-list" v-if="community.tags">
				<draggable v-model="community.tags" @change="saveTagSort">
					<li v-for="tag in community.tags" :key="tag.id">
						<a class="tag">
							<app-jolticon icon="tag" class="text-muted" />
							{{ tag.tag }}

							<a @click.stop="onClickRemoveTag(tag)">
								<app-jolticon icon="remove" v-app-tooltip="$gettext(`Remove Tag`)" />
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
		</template>
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

.-tag-list
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
</style>

<script lang="ts" src="./edit"></script>
