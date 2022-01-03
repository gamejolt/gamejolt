<script lang="ts" src="./settings"></script>

<template>
	<div class="row">
		<div class="col-md-8">
			<template v-if="!isCollaborator">
				<form-game-settings :model="game" @submit="onSaved" />

				<br />
			</template>

			<div v-if="!isWizard" class="-danger-zone well fill-offset">
				<template v-if="isCollaborator">
					<h4>
						<translate>Leave Project</translate>
					</h4>

					<div class="page-help">
						<p>
							<translate>
								You are currently a collaborator on this project. Leaving the
								project will revoke all management access to the game, including any
								devlog posts you may have written for it.
							</translate>
						</p>
					</div>

					<app-button @click="leaveProject()">
						<translate>Leave Project</translate>
					</app-button>
				</template>
				<template v-else>
					<template v-if="!isUnlisted">
						<h4>
							<translate>Unlist Game</translate>
						</h4>

						<div class="page-help">
							<p>
								<translate>
									Your game page is currently published. You can unlist it to hide
									it from the game listings. People with the link will still be
									able to view it.
								</translate>
							</p>
							<p v-if="hasCompetitionEntries" v-translate>
								<b>Warning:</b> This will remove your game from any jams that you
								have entered it into.
							</p>
						</div>

						<app-button @click="hide()">
							<translate>Unlist Game</translate>
						</app-button>
					</template>

					<template v-if="!isCanceled">
						<h4>
							<translate>Cancel Game</translate>
						</h4>

						<div class="page-help">
							<p>
								<translate>
									Canceling your game will signal to everyone that you're no
									longer working on it. People will still be able to view the game
									page and access your published packages, but it will not show in
									game listings.
								</translate>
							</p>
							<p>
								<translate>
									If you've transitioned development off of Game Jolt, you must
									remove your game instead.
								</translate>
							</p>
						</div>

						<app-button @click="cancel()">
							<translate>Cancel Game</translate>
						</app-button>
					</template>

					<h4>
						<translate>Remove Game</translate>
					</h4>

					<div class="page-help">
						<p v-translate>
							Removing your game page will remove it from the site completely.
							<b>This is permanent!</b>
						</p>
						<p v-if="hasCompetitionEntries" v-translate>
							<b>Warning:</b> This will also remove your game from any jams that you
							have entered it into.
						</p>
					</div>

					<div v-if="game.has_sales" class="alert">
						<translate>
							You can't remove games with active sales at this time.
						</translate>
					</div>

					<app-button :disabled="game.has_sales" @click="removeGame()">
						<translate>Remove Game</translate>
					</app-button>
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-danger-zone
	h4:first-of-type
		margin-top: 0
</style>
