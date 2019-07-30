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
							<div v-if="isGame" class="-game-thumbnail">
								<div class="help-inline">
									<translate>View the game this trophy belongs to</translate>
								</div>
								<app-game-thumbnail :game="userTrophy.game" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-content
	position: relative
	overflow: hidden

	@media $media-sm-up
		rounded-corners-lg()

.-background
	display: flex
	justify-content: center
	align-items: center

.-bg
	position: absolute
	width: 200%
	height: 200%
	min-height: 500px
	z-index: 1
	transform: rotateZ(30deg)
	background-image: url('../pattern.png')

.-trophy-difficulty-1
	background-color: rgba(248, 198, 143, 0.3)

.-trophy-difficulty-2
	background-color: rgba(207, 207, 207, 0.3)

.-trophy-difficulty-3
	background-color: rgba(255, 207, 39, 0.3)

.-trophy-difficulty-4
	background-color: rgba(176, 205, 217, 0.3)

.-bg-gradient
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	z-index: 2
	background: linear-gradient(transparent 0%, var(--theme-bg-actual) 50%)

.-content-inner
	position: relative
	z-index: 3

.-trophy-view
	display: flex

	@media $media-xs
		flex-direction: column

.-thumbnail
	flex-shrink: 0

	@media $media-xs
		margin-bottom: $line-height-computed

	& > *
		width: 100px

.-trophy-type
	display: inline-block
	margin-bottom: 10px

	& > *
		vertical-align: middle

.-avatar
	display: inline-block
	width: 32px
	margin-right: 10px
	flex-shrink: 0

.-info
	@media $media-sm-up
		margin-left: 20px
		flex-grow: 1

.-user-info
	display: flex
	align-items: center
	margin-bottom: $line-height-computed

.-description
	word-break: break-word
	margin-bottom: $line-height-computed

.-game-thumbnail
	max-width: 300px

</style>

<script lang="ts" src="./modal"></script>
