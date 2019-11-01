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
					<h2 class="modal-title -title">
						{{ trophy.title }}
					</h2>
					<div class="-subtitle small text-muted">
						<template v-if="isGame">
							<router-link
								:to="game.routeLocation"
								class="-subtitle-link link-unstyled"
								v-app-tooltip="game.title"
							>
								<app-jolticon icon="game" />
								<span v-translate="{ title: game.title }">
									Game Trophy of
									<b>%{ title }</b>
								</span>
							</router-link>
						</template>
						<template v-else>
							<app-jolticon icon="gamejolt" />
							<span>Game Jolt Trophy</span>
							<router-link v-if="artist" :to="artist.url" class="-subtitle-link link-unstyled">
								<span class="dot-separator" />
								<app-user-card-hover :user="artist">
									<span v-translate="{ username: artist.username }">
										Art by
										<b>@%{ username }</b>
									</span>
									<span class="-subtitle-avatar">
										<app-user-avatar-img :user="artist" />
									</span>
								</app-user-card-hover>
							</router-link>
						</template>
					</div>
				</div>

				<div class="modal-body">
					<div class="-trophy-view">
						<div class="-thumbnail">
							<app-trophy-thumbnail
								:trophy="trophy"
								no-tooltip
								:no-highlight="loggedInUserUnlocked"
							/>
							<div v-if="canReceiveExp" class="-exp text-muted">
								<app-jolticon icon="exp" />
								<span v-translate="{ exp: trophy.experience }">
									%{ exp } EXP
								</span>
							</div>
						</div>
						<div class="-info">
							<span class="text-muted small">
								Achieved
								<app-time-ago :date="userTrophy.logged_on" />
							</span>

							<span v-if="completionPercentageForDisplay" class="text-muted small">
								<span class="dot-separator small" v-if="Screen.isDesktop" />
								<br v-else />
								<span v-if="completionPercentageForDisplay === 1">
									<translate>&lt;1% of players achieved this trophy</translate>
								</span>
								<span v-else-if="completionPercentageForDisplay === 100">
									<translate>
										100% of players achieved this trophy
									</translate>
								</span>
								<span v-else v-translate="{ num: completionPercentageForDisplay }">
									~%{ num }% of players achieved this trophy
								</span>
							</span>

							<div class="-description well fill-offset">
								{{ trophy.description }}
							</div>

							<div v-if="shouldShowFriends" class="small">
								<div>
									<translate>Friends who achieved this trophy</translate>
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
