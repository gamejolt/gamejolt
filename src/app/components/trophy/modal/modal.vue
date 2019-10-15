<template>
	<app-modal>
		<div class="-content">
			<div class="-background">
				<div class="-bg" :class="bgClass"></div>
				<div class="-bg-gradient"></div>
			</div>
			<div class="-content-inner">
				<div class="modal-controls">
					<app-button @click="modal.dismiss()">
						<translate>Close</translate>
					</app-button>
				</div>

				<div class="modal-header">
					<h2 class="modal-title">
						{{ trophy.title }}
					</h2>
				</div>

				<div class="modal-body">
					<div class="-trophy-view">
						<div class="-thumbnail">
							<app-trophy-thumbnail :trophy="trophy" no-tooltip />
						</div>
						<div class="-info">
							<small class="-trophy-type text-muted">
								<template v-if="isGame">
									<app-jolticon icon="game" />
									<span>Game Trophy</span>
								</template>
								<template v-else>
									<app-jolticon icon="gamejolt" />
									<span>Game Jolt Trophy</span>
								</template>
							</small>
							<span class="dot-separator small" />
							<span class="text-muted small">
								Achieved
								<app-time-ago :date="userTrophy.logged_on" />
							</span>

							<div v-if="completionPercentageForDisplay" class="text-muted small">
								<span v-if="completionPercentageForDisplay === 1">
									<translate>&lt;1% of players unlocked this trophy</translate>
								</span>
								<span v-else-if="completionPercentageForDisplay === 100">
									<translate>
										All players unlocked this trophy
									</translate>
								</span>
								<span v-else v-translate="{ num: completionPercentageForDisplay }">
									~%{ num }% of players unlocked this trophy
								</span>
							</div>

							<div class="-description well fill-offset">
								{{ trophy.description }}
							</div>

							<div v-if="shouldShowFriends" class="small">
								<div>
									<translate>Friends who unlocked this trophy</translate>
								</div>

								<app-user-avatar-list :users="friends" sm />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" src="./modal.styl" scoped></style>

<script lang="ts" src="./modal"></script>
