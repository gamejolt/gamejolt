<template>
	<div class="route-discover-games-view" v-if="game">
		<app-game-maturity-block :game="game">
			<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
				<div class="container text-center">
					<p v-translate="{ username: game.developer.username }">
						<b>@%{ username }</b>
						has invited you to collaborate on this game.
					</p>
					<app-button primary @click="acceptCollaboration()">
						<translate>Accept</translate>
					</app-button>
					<app-button trans @click="declineCollaboration()">
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
				:blur-header="!shouldShowFullCover"
				:cover-auto-height="!shouldShowFullCover"
				:autoscroll-anchor-key="autoscrollAnchorKey"
				:show-cover-buttons="shouldShowCoverButtons"
			>
				<template slot="cover-buttons" v-if="shouldShowCoverButtons">
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
						@show-package-payment="scrollToPackagePayment"
					/>

					<app-game-perms :game="game">
						<!-- we need this stupid space for some reason -->
						<nbsp />

						<app-button
							circle
							trans
							icon="cog"
							:to="{
								name: 'dash.games.manage.game.overview',
								params: { id: game.id },
							}"
							v-app-tooltip="$gettext(`Manage Game`)"
						/>

						<app-game-perms :game="game" required="analytics">
							<app-button
								circle
								trans
								icon="chart"
								:to="{
									name: 'dash.analytics',
									params: { resource: 'Game', resourceId: game.id },
								}"
								v-app-tooltip="$gettext(`View Game Analytics`)"
							/>
						</app-game-perms>
					</app-game-perms>
				</template>

				<app-user-card-hover slot="spotlight" :user="game.developer">
					<app-user-avatar :user="game.developer" />
				</app-user-card-hover>

				<app-discover-games-view-nav slot="nav" />

				<app-discover-games-view-controls slot="controls" />

				<h1 :class="{ h2: Screen.isMobile }">
					<router-link :to="{ name: 'discover.games.view.overview' }">
						{{ game.title }}
					</router-link>
				</h1>

				<div>
					<translate>by</translate>
					<router-link
						:to="{ name: 'profile.overview', params: { username: game.developer.username } }"
					>
						{{ game.developer.display_name }}
						<small>@{{ game.developer.username }}</small>
					</router-link>
				</div>
			</app-page-header>

			<router-view />
		</app-game-maturity-block>
	</div>
</template>

<script lang="ts" src="./view"></script>
