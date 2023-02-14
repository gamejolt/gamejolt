<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { Game } from '../../../../../_common/game/game.model';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import AppPageHeader from '../../../../components/page-header/AppPageHeader.vue';
import { createGameDashRouteController, ManageGameThemeKey } from './manage.store';

@Options({
	name: 'RouteDashGamesManage',
	components: {
		AppPageHeader,
		AppExpand,
		AppTimeAgo,
		AppGamePerms,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute({
	deps: { params: ['id'], query: ['intent'] },
	async resolver({ route }) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'accept-game-collaboration',
			message: $gettext(`You're now a collaborator for this project!`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/dash/developer/games/' + route.params.id);
	},
})
export default class RouteDashGamesManage extends BaseRouteComponent {
	routeStore = setup(() => createGameDashRouteController({ router: useRouter() }));
	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());

	readonly Game = Game;
	readonly GAME_LOCKED_STATUS_DMCA = Game.LOCKED_STATUS_DMCA;
	readonly GAME_LOCKED_STATUS_ADULT = Game.LOCKED_STATUS_ADULT;

	get user() {
		return this.commonStore.user!;
	}

	get game() {
		return this.routeStore.game;
	}

	get isWizard() {
		return this.routeStore.isWizard;
	}

	routeResolved(payload: any) {
		this.routeStore.populate(payload);
		this.setPageTheme();
	}

	routeDestroyed() {
		this.themeStore.clearPageTheme(ManageGameThemeKey);
	}

	private setPageTheme() {
		const theme = this.game?.theme ?? null;
		this.themeStore.setPageTheme({
			key: ManageGameThemeKey,
			theme,
		});
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped && game">
		<section v-if="game.is_locked" class="section section-thin fill-notice">
			<div class="container">
				<div class="col-sm-10 col-md-8 col-lg-6 col-centered text-center">
					<p>
						<AppJolticon icon="notice" big />
					</p>
					<template v-if="game.locked_status === GAME_LOCKED_STATUS_DMCA">
						<div key="locked-reason-dmca">
							<p>
								<b
									><AppTranslate
										>This game was removed from the site.</AppTranslate
									></b
								>
							</p>
							<p>
								<AppTranslate>
									We have received a DMCA takedown notice and were required to
									remove it from the site. Only you are able to view it.
								</AppTranslate>
							</p>
						</div>
					</template>
					<template v-else-if="game.locked_status === GAME_LOCKED_STATUS_ADULT">
						<div key="locked-reason-adult">
							<p>
								<b><AppTranslate>This page is made private.</AppTranslate></b>
							</p>
							<p>
								<AppTranslate>
									The game page has been removed from Game Jolt's public listings.
									You have access to this page and its contents until December 31,
									2022.
								</AppTranslate>
							</p>
						</div>
					</template>
				</div>
			</div>
		</section>

		<AppPageHeader :hide-nav="isWizard">
			<div class="row">
				<div class="col-sm-8">
					<template v-if="isWizard">
						<h1 class="section-header">
							<AppTranslate>Add Game</AppTranslate>
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
							<AppTranslate>Early Access</AppTranslate>
						</span>
						<span v-else-if="game._is_devlog" class="tag">
							<AppTranslate>Devlog</AppTranslate>
						</span>

						<template v-if="!isWizard">
							<span v-if="game.isUnlisted" class="tag tag-notice">
								<AppTranslate>Unlisted</AppTranslate>
							</span>

							<template v-if="game.isVisible && game.published_on">
								<span class="tag tag-highlight">
									<AppTranslate>Published</AppTranslate>
								</span>
								<span class="dot-separator" />
								<AppTimeAgo :date="game.published_on" />
							</template>
						</template>
					</p>
				</div>
				<div v-if="!isWizard" class="col-sm-4">
					<p>
						<AppGamePerms required="analytics">
							<AppButton
								icon="chart"
								class="hidden-xs"
								:to="{
									name: 'dash.analytics',
									params: { resource: 'Game', resourceId: game.id },
								}"
							>
								<AppTranslate>View Analytics</AppTranslate>
							</AppButton>
						</AppGamePerms>
						{{ ' ' }}
						<AppButton icon="arrow-forward" :to="game.getUrl()">
							<AppTranslate>View Game Page</AppTranslate>
						</AppButton>
					</p>
				</div>
			</div>

			<AppExpand :when="!isWizard && game.isUnlisted">
				<div class="alert alert-notice">
					<AppTranslate>
						This game is currently unlisted from the public game listings, but can still
						be accessed through your game's URL.
					</AppTranslate>
					<template v-if="!game.published_on">
						<AppTranslate>
							We recommend keeping it unlisted until you've finished filling out the
							details and added some media. Don't forget to publish it when it's
							ready!
						</AppTranslate>
					</template>
				</div>
			</AppExpand>

			<AppExpand :when="game.isVisible && !game.is_listable">
				<div v-translate class="alert alert-notice">
					<b>Your game page is no longer visible in game listings!</b>
					It must have active game builds for it to show.
				</div>
			</AppExpand>

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
								<AppTranslate>Overview/Setup</AppTranslate>
							</router-link>
						</li>
						<li v-app-tooltip.bottom="$gettext(`Manage news updates for your game.`)">
							<router-link
								:to="{ name: 'dash.games.manage.devlog' }"
								:class="{
									active: $route.name.indexOf('dash.games.manage.devlog') === 0,
								}"
							>
								<AppTranslate>Devlog</AppTranslate>
							</router-link>
						</li>
						<AppGamePerms
							v-app-tooltip.bottom="
								$gettext(
									`Manage your game's API integration (trophies, scoreboards, data storage, etc.)`
								)
							"
							required="game-api"
							tag="li"
						>
							<router-link
								:to="{ name: 'dash.games.manage.api.overview' }"
								:class="{
									active: $route.name.indexOf('dash.games.manage.api') === 0,
								}"
							>
								<AppTranslate>Game API</AppTranslate>
							</router-link>
						</AppGamePerms>
						<AppGamePerms
							v-if="!game.is_locked"
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
								<AppTranslate>Keys/Access</AppTranslate>
							</router-link>
						</AppGamePerms>
						<AppGamePerms
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
								<AppTranslate>Site</AppTranslate>
							</router-link>
						</AppGamePerms>

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
								<AppTranslate>Collaborators</AppTranslate>
							</router-link>
						</li>
					</ul>
				</nav>
			</template>
		</AppPageHeader>

		<router-view />
	</div>
</template>
