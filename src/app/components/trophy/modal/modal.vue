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
							<div class="-user-info">
								<app-user-avatar class="-avatar" :user="userTrophy.user" />
								<div>
									<div>
										<b>
											<template v-if="isAchiever">
												You
											</template>
											<template v-else>
												{{ userTrophy.user.display_name }}
											</template>
										</b>
										<app-user-verified-tick :user="userTrophy.user" />
										achieved this trophy
										<app-time-ago :date="userTrophy.logged_on" />
										.
									</div>
									<div v-if="canReceiveExp" class="-exp text-muted">
										<app-jolticon icon="exp" />
										<translate :translate-params="{ num: trophy.experience }">
											%{ num } EXP
										</translate>
									</div>
									<div v-else-if="isDeveloper">
										<small class="text-muted">
											<translate>
												You are the developer of this trophy's game and are not receiving EXP from
												it.
											</translate>
										</small>
									</div>
								</div>
							</div>
							<div class="-description well fill-offset">
								{{ trophy.description }}
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
