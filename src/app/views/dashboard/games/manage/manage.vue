<script lang="ts" src="./manage"></script>

<template>
	<div v-if="isRouteBootstrapped">
		<section v-if="game.is_locked" class="section section-thin fill-notice">
			<div class="container">
				<div class="col-sm-10 col-md-8 col-lg-6 col-centered text-center">
					<p>
						<app-jolticon icon="notice" big />
					</p>
					<p>
						<b><translate>This game was removed from the site.</translate></b>
					</p>
					<p>
						<translate>
							We have received a DMCA takedown notice and were required to remove it
							from the site. Only you are able to view it.
						</translate>
					</p>
				</div>
			</div>
		</section>

		<app-page-header :hide-nav="isWizard">
			<div class="row">
				<div class="col-sm-8">
					<template v-if="isWizard">
						<h1 class="section-header">
							<translate>Add Game</translate>
						</h1>
						<h4 class="section-header">
							{{ game.title }}
						</h4>
					</template>
					<template v-else>
						<h1 class="section-header">
							<template v-if="game.developer.id !== user.id">
								<small>
									<router-link
										:to="{
											name: 'profile.overview',
											params: {
												username: game.developer.username,
											},
										}"
									>
										@{{ game.developer.username }}
									</router-link>
								</small>
								<br />
							</template>
							{{ game.title }}
						</h1>
					</template>

					<p class="text-muted small">
						<span v-if="game._is_wip" class="tag">
							<translate>Early Access</translate>
						</span>
						<span v-else-if="game._is_devlog" class="tag">
							<translate>Devlog</translate>
						</span>

						<template v-if="!isWizard">
							<span v-if="game.isUnlisted" class="tag tag-notice">
								<translate>Unlisted</translate>
							</span>

							<template v-if="game.isVisible">
								<span class="tag tag-highlight">
									<translate>dash.games.published_tag</translate>
								</span>
								<span class="dot-separator" />
								<app-time-ago :date="game.published_on" />
							</template>
						</template>
					</p>
				</div>
				<div v-if="!isWizard" class="col-sm-4">
					<p>
						<app-game-perms required="analytics">
							<app-button
								icon="chart"
								class="hidden-xs"
								:to="{
									name: 'dash.analytics',
									params: { resource: 'Game', resourceId: game.id },
								}"
							>
								<translate>View Analytics</translate>
							</app-button>
						</app-game-perms>
						<app-button icon="arrow-forward" :to="game.getUrl()">
							<translate>dash.games.view_page_button</translate>
						</app-button>
					</p>
				</div>
			</div>

			<app-expand :when="!isWizard && game.isUnlisted">
				<div class="alert alert-notice">
					<translate>This game is currently unlisted from public view.</translate>
					<template v-if="!game.published_on">
						<translate>
							We recommend keeping it unlisted until you've finished filling out the
							details and added some media. Don't forget to publish it when it's
							ready, or it won't show up in the game listings!
						</translate>
					</template>
				</div>
			</app-expand>

			<app-expand :when="game.isVisible && !game.is_listable">
				<div v-translate class="alert alert-notice">
					<b>Your game page is no longer visible in game listings!</b>
					It must have active game builds for it to show.
				</div>
			</app-expand>

			<template #nav>
				<nav class="platform-list inline">
					<ul>
						<li
							v-app-tooltip.bottom="
								$gettext(`Set up your game page and manage its builds.`)
							"
						>
							<router-link
								:to="{ name: 'dash.games.manage.game.overview' }"
								:class="{
									active: $route.name.indexOf('dash.games.manage.game') === 0,
								}"
							>
								<translate>Overview/Setup</translate>
							</router-link>
						</li>
						<li v-app-tooltip.bottom="$gettext(`dash.games.news_tooltip`)">
							<router-link
								:to="{ name: 'dash.games.manage.devlog' }"
								:class="{
									active: $route.name.indexOf('dash.games.manage.devlog') === 0,
								}"
							>
								<translate>Devlog</translate>
							</router-link>
						</li>
						<app-game-perms
							v-app-tooltip.bottom="$gettext(`dash.games.api_tooltip`)"
							required="game-api"
							tag="li"
						>
							<router-link
								:to="{ name: 'dash.games.manage.api.overview' }"
								:class="{
									active: $route.name.indexOf('dash.games.manage.api') === 0,
								}"
							>
								<translate>dash.games.api_tab</translate>
							</router-link>
						</app-game-perms>
						<app-game-perms
							v-app-tooltip.bottom="
								$gettext(`Manage your game keys and give access to users.`)
							"
							required="sales"
							tag="li"
						>
							<router-link
								:to="{ name: 'dash.games.manage.key-groups.list' }"
								:class="{
									active:
										$route.name.indexOf('dash.games.manage.key-groups') === 0,
								}"
							>
								<translate>Keys/Access</translate>
							</router-link>
						</app-game-perms>
						<app-game-perms
							v-app-tooltip.bottom="
								$gettext(
									`Game Jolt Sites are customizable external sites for your portfolio and games!`
								)
							"
							required="all"
							tag="li"
						>
							<router-link
								:to="{ name: 'dash.games.manage.site' }"
								active-class="active"
							>
								<translate>Site</translate>
							</router-link>
						</app-game-perms>

						<li
							v-if="game.developer.id == user.id"
							v-app-tooltip.bottom="
								$gettext(`Allow other users to manage your game.`)
							"
						>
							<router-link
								:to="{ name: 'dash.games.manage.collaborators' }"
								active-class="active"
							>
								<translate>Collaborators</translate>
							</router-link>
						</li>
					</ul>
				</nav>
			</template>
		</app-page-header>

		<router-view />
	</div>
</template>
