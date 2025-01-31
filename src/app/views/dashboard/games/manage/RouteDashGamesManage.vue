<script lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { GameLockedStatus } from '../../../../../_common/game/game.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import AppPageHeader from '../../../../components/page-header/AppPageHeader.vue';
import AppShellPageBackdrop from '../../../../components/shell/AppShellPageBackdrop.vue';
import { ManageGameThemeKey, createGameDashRouteController } from './manage.store';

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['id'], query: ['intent'] },
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
	}),
};
</script>

<script lang="ts" setup>
const { game, isWizard, populate } = createGameDashRouteController({ router: useRouter() });
const { setPageTheme, clearPageTheme } = useThemeStore();
const { user } = useCommonStore();
const route = useRoute();

function applyPageTheme() {
	const theme = game?.value?.theme ?? null;
	setPageTheme({
		key: ManageGameThemeKey,
		theme,
	});
}

const { isBootstrapped } = createAppRoute({
	onDestroyed() {
		clearPageTheme(ManageGameThemeKey);
	},
	onResolved({ payload }) {
		populate(payload);
		applyPageTheme();
	},
});
</script>

<template>
	<div v-if="isBootstrapped && game">
		<section v-if="game.is_locked" class="section section-thin fill-notice">
			<div class="container">
				<div class="col-sm-10 col-md-8 col-lg-6 col-centered text-center">
					<p>
						<AppJolticon icon="notice" big />
					</p>
					<template v-if="game.locked_status === GameLockedStatus.Dmca">
						<div key="locked-reason-dmca">
							<p>
								<b>
									{{ $gettext(`This game was removed from the site.`) }}
								</b>
							</p>
							<p>
								{{
									$gettext(
										`We have received a DMCA takedown notice and were required to remove it from the site. Only you are able to view it.`
									)
								}}
							</p>
						</div>
					</template>
					<template v-else-if="game.locked_status === GameLockedStatus.Adult">
						<div key="locked-reason-adult">
							<p>
								<b>
									{{ $gettext(`This page is made private.`) }}
								</b>
							</p>
							<p>
								{{
									$gettext(
										`The game page has been removed from Game Jolt's public listings. You have access to this page and its contents until December 31, 2022.`
									)
								}}
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
							{{ $gettext(`Add Game`) }}
						</h1>
						<h4 class="section-header">
							{{ game.title }}
						</h4>
					</template>
					<template v-else>
						<h1 class="section-header">
							<template v-if="user && user.id !== game.developer.id">
								<small>
									<RouterLink
										:to="{
											name: 'profile.overview',
											params: {
												username: game.developer.username,
											},
										}"
									>
										@{{ game.developer.username }}
									</RouterLink>
								</small>
								<br />
							</template>
							{{ game.title }}
						</h1>
					</template>

					<p class="text-muted small">
						<span v-if="game._is_wip" class="tag">
							{{ $gettext(`Early Access`) }}
						</span>
						<span v-else-if="game._is_devlog" class="tag">
							{{ $gettext(`Devlog`) }}
						</span>

						<template v-if="!isWizard">
							<span v-if="game.isUnlisted" class="tag tag-notice">
								{{ $gettext(`Unlisted`) }}
							</span>

							<template v-if="game.isVisible && game.published_on">
								<span class="tag tag-highlight">
									{{ $gettext(`Published`) }}
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
								{{ $gettext(`View Analytics`) }}
							</AppButton>
						</AppGamePerms>
						{{ ' ' }}
						<AppButton icon="arrow-forward" :to="game.getUrl()">
							{{ $gettext(`View Game Page`) }}
						</AppButton>
					</p>
				</div>
			</div>

			<AppExpand :when="!isWizard && game.isUnlisted">
				<div class="alert alert-notice">
					{{
						$gettext(
							`This game is currently unlisted from the public game listings, but can still be accessed through your game's URL.`
						)
					}}
					<template v-if="!game.published_on">
						{{
							$gettext(
								`We recommend keeping it unlisted until you've finished filling out the details and added some media. Don't forget to publish it when it's ready!`
							)
						}}
					</template>
				</div>
			</AppExpand>

			<AppExpand :when="game.isVisible && !game.is_listable">
				<div>
					<b>
						{{ $gettext(`Your game page is no longer visible in game listings!`) }}
					</b>
					{{ ' ' }}
					{{ $gettext(`It must have active game builds for it to show.`) }}
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
							<RouterLink
								:to="{ name: 'dash.games.manage.game.overview' }"
								:class="{
									active:
										typeof route.name === 'string' &&
										route.name.indexOf('dash.games.manage.game') === 0,
								}"
							>
								{{ $gettext(`Overview/Setup`) }}
							</RouterLink>
						</li>
						<li v-app-tooltip.bottom="$gettext(`Manage news updates for your game.`)">
							<RouterLink
								:to="{ name: 'dash.games.manage.devlog' }"
								:class="{
									active:
										typeof route.name === 'string' &&
										route.name.indexOf('dash.games.manage.devlog') === 0,
								}"
							>
								{{ $gettext(`Devlog`) }}
							</RouterLink>
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
							<RouterLink
								:to="{ name: 'dash.games.manage.api.overview' }"
								:class="{
									active:
										typeof route.name === 'string' &&
										route.name.indexOf('dash.games.manage.api') === 0,
								}"
							>
								{{ $gettext(`Game API`) }}
							</RouterLink>
						</AppGamePerms>
						<AppGamePerms
							v-if="!game.is_locked"
							v-app-tooltip.bottom="
								$gettext(`Manage your game keys and give access to users.`)
							"
							required="sales"
							tag="li"
						>
							<RouterLink
								:to="{ name: 'dash.games.manage.key-groups.list' }"
								:class="{
									active:
										typeof route.name === 'string' &&
										route.name.indexOf('dash.games.manage.key-groups') === 0,
								}"
							>
								{{ $gettext(`Keys/Access`) }}
							</RouterLink>
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
							<RouterLink
								:to="{ name: 'dash.games.manage.site' }"
								active-class="active"
							>
								{{ $gettext(`Site`) }}
							</RouterLink>
						</AppGamePerms>

						<li
							v-if="user && user.id == game.developer.id"
							v-app-tooltip.bottom="
								$gettext(`Allow other users to manage your game.`)
							"
						>
							<RouterLink
								:to="{ name: 'dash.games.manage.collaborators' }"
								active-class="active"
							>
								{{ $gettext(`Collaborators`) }}
							</RouterLink>
						</li>
					</ul>
				</nav>
			</template>
		</AppPageHeader>

		<AppShellPageBackdrop>
			<RouterView />
		</AppShellPageBackdrop>
	</div>
</template>
