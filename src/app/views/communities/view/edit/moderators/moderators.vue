<script lang="ts" src="./moderators"></script>

<template>
	<app-communities-view-page-container>
		<h2 class="section-header">
			<translate>Collaborators</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					Assign collaborators and choose their access level to help manage your
					community.
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
							<translate>Full Collaborator</translate>
						</template>
						<template v-else-if="collaborator.role === Collaborator.ROLE_JAM_ORGANIZER">
							<translate>Jam Organizer</translate>
						</template>
						<template v-else-if="collaborator.role === Collaborator.ROLE_MODERATOR">
							<translate>Moderator</translate>
						</template>
						<template v-else> - </template>
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
	</app-communities-view-page-container>
</template>
