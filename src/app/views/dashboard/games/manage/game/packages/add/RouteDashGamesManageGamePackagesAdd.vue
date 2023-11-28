<script lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { GamePackageModel } from '../../../../../../../../_common/game/package/package.model';
import AppJolticon from '../../../../../../../../_common/jolticon/AppJolticon.vue';
import AppLinkHelp from '../../../../../../../../_common/link/AppLinkHelp.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../../../_common/translate/translate.service';
import FormGamePackage from '../../../../../../../components/forms/game/package/package.vue';
import { useGameDashRouteController } from '../../../manage.store';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const router = useRouter();
const { game } = useGameDashRouteController()!;

function onPackageAdded(newPackage: GamePackageModel) {
	router.push({
		name: 'dash.games.manage.game.packages.edit',
		params: { packageId: newPackage.id + '' },
	});
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Add Package for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
});
</script>

<template>
	<div>
		<nav class="breadcrumb">
			<ul>
				<li>
					<RouterLink :to="{ name: 'dash.games.manage.game.packages.list' }">
						<span class="breadcrumb-tag">&nbsp;</span>
						{{ $gettext(`Packages`) }}
					</RouterLink>
					<AppJolticon icon="chevron-right" class="breadcrumb-separator" />
				</li>
				<li>
					<span class="active">
						<span class="breadcrumb-tag">&nbsp;</span>
						{{ $gettext(`Add Package`) }}
					</span>
				</li>
			</ul>
		</nav>

		<hr />

		<div class="row">
			<div
				class="hidden-xs col-sm-4 col-sm-push-8 col-md-4 col-md-push-8 col-lg-4 col-lg-push-8"
			>
				<div class="page-help">
					<p>
						{{
							$gettext(
								`Packages are how you organize and distribute your game's builds and other files.`
							)
						}}
					</p>
					<p>
						{{
							$gettext(
								`Your primary package should contain the builds you want people to play. You can create new packages to contain additional files, such as level editors, art packs, expansions, and other DLC.`
							)
						}}
					</p>
					<p>
						<AppLinkHelp page="dev-packages" class="link-help">
							{{ $gettext(`Learn more about packages...`) }}
						</AppLinkHelp>
					</p>
				</div>
			</div>
			<div class="col-sm-8 col-sm-pull-4 col-md-7 col-md-pull-4 col-lg-8 col-lg-pull-4">
				<FormGamePackage :game="game!" @submit="onPackageAdded" />
			</div>
		</div>
	</div>
</template>
