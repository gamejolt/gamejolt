<script lang="ts" src="./view"></script>

<template>
	<div v-if="game" class="route-discover-games-view">
		<app-game-maturity-block :game="game">
			<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
				<div class="container text-center">
					<p v-translate="{ username: game.developer.username }">
						<b>@%{ username }</b>
						has invited you to collaborate on this game.
					</p>
					<app-button solid @click="acceptCollaboration()">
						<translate>Accept</translate>
					</app-button>
					<app-button solid @click="declineCollaboration()">
						<translate>Decline</translate>
					</app-button>
				</div>
			</section>

			<!--
				Don't affix the nav on download pages.
				It takes a lot of space out vertically when on small browser size.
			-->
			<app-page-header
				:cover-media-item="game.header_media_item"
				should-affix-nav
				:autoscroll-anchor-key="autoscrollAnchorKey"
				:show-cover-buttons="shouldShowCoverButtons"
			>
				<template v-if="shouldShowCoverButtons" #cover-buttons>
					<app-game-cover-buttons
						v-if="!Screen.isXs"
						:game="game"
						:packages="packages"
						:downloadable-builds="downloadableBuilds"
						:browser-builds="browserBuilds"
						:installable-builds="installableBuilds"
						:partner-key="partnerKey"
						:partner="partner"
						@show-multiple-packages="scrollToMultiplePackages"
					/>

					<app-game-perms :game="game">
						<!-- we need this stupid space for some reason -->
						&nbsp;

						<app-button
							v-app-tooltip="$gettext(`Manage Game`)"
							circle
							trans
							icon="cog"
							:to="{
								name: 'dash.games.manage.game.overview',
								params: { id: game.id },
							}"
						/>

						<app-game-perms :game="game" required="analytics">
							<app-button
								v-app-tooltip="$gettext(`View Game Analytics`)"
								circle
								trans
								icon="chart"
								:to="{
									name: 'dash.analytics',
									params: { resource: 'Game', resourceId: game.id },
								}"
							/>
						</app-game-perms>
					</app-game-perms>
				</template>

				<template #spotlight>
					<app-user-card-hover :user="game.developer">
						<app-user-avatar :user="game.developer" />
					</app-user-card-hover>
				</template>

				<template #nav>
					<app-discover-games-view-nav />
				</template>

				<template #controls>
					<app-discover-games-view-controls />
				</template>

				<h1 :class="{ h2: Screen.isMobile }">
					<router-link :to="{ name: 'discover.games.view.overview' }">
						{{ game.title }}
					</router-link>
				</h1>

				<div>
					<translate>by</translate>
					<router-link
						:to="{
							name: 'profile.overview',
							params: { username: game.developer.username },
						}"
					>
						{{ game.developer.display_name }}
						<app-user-verified-tick :user="game.developer" />
						<small>@{{ game.developer.username }}</small>
					</router-link>
				</div>
			</app-page-header>

			<router-view />
		</app-game-maturity-block>
	</div>
</template>
