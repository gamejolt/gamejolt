<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-4 col-sm-push-8">
					<div class="page-help">
						<p>
							<translate>
								Allow other users to manage your game by giving them collaborator roles.
							</translate>
						</p>
					</div>
				</div>

				<div class="col-sm-8 col-sm-pull-4">
					<app-card-list
						:items="collaborators"
						:active-item="activeCollaborator"
						:is-adding="isAdding"
						@activate="activeCollaborator = $event"
					>
						<app-card-list-item
							v-for="collaborator of collaborators"
							:key="collaborator.id"
							:item="collaborator"
						>
							<a class="card-remove" @click.stop="remove(collaborator)">
								<app-jolticon icon="remove" />
							</a>

							<div class="card-title">
								<h5>{{ collaborator.user.username }}</h5>
							</div>

							<div class="card-meta">
								<span class="tag">
									<template v-if="collaborator.role === Collaborator.ROLE_GAME_COLLABORATOR">
										<translate>Collaborator</translate>
									</template>
									<template
										v-else-if="collaborator.role === Collaborator.ROLE_GAME_COMMUNITY_MANAGER"
									>
										<translate>Community Manager</translate>
									</template>
									<template v-else-if="collaborator.role === Collaborator.ROLE_GAME_DEVELOPER">
										<translate>Developer</translate>
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
								<form-game-collaborator :model="collaborator" :game="game" @submit="onSaved" />
							</template>
						</app-card-list-item>

						<app-card-list-add :label="$gettext(`Add Collaborator`)" @toggle="isAdding = !isAdding">
							<form-game-collaborator :game="game" @submit="onAdded" />
						</app-card-list-add>
					</app-card-list>
				</div>
			</div>
		</div>
	</section>
</template>

<script lang="ts" src="./collaborators"></script>
