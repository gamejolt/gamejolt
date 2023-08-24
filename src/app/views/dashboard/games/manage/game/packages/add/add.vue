<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { GamePackageModel } from '../../../../../../../../_common/game/package/package.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../_common/route/legacy-route-component';
import FormGamePackage from '../../../../../../../components/forms/game/package/package.vue';
import { useGameDashRouteController } from '../../../manage.store';

@Options({
	name: 'RouteDashGamesManageGamePackagesAdd',
	components: {
		FormGamePackage,
	},
})
@OptionsForLegacyRoute()
export default class RouteDashGamesManageGamePackagesAdd extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Add Package for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	onPackageAdded(newPackage: GamePackageModel) {
		this.$router.push({
			name: 'dash.games.manage.game.packages.edit',
			params: { packageId: newPackage.id + '' },
		});
	}
}
</script>

<template>
	<div>
		<nav class="breadcrumb">
			<ul>
				<li>
					<router-link :to="{ name: 'dash.games.manage.game.packages.list' }">
						<span class="breadcrumb-tag">&nbsp;</span>
						<AppTranslate>Packages</AppTranslate>
					</router-link>
					<AppJolticon icon="chevron-right" class="breadcrumb-separator" />
				</li>
				<li>
					<span class="active">
						<span class="breadcrumb-tag">&nbsp;</span>
						<AppTranslate>Add Package</AppTranslate>
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
						<AppTranslate>
							Packages are how you organize and distribute your game's builds and
							other files.
						</AppTranslate>
					</p>
					<p>
						<AppTranslate>
							Your primary package should contain the builds you want people to play.
							You can create new packages to contain additional files, such as level
							editors, art packs, expansions, and other DLC.
						</AppTranslate>
					</p>
					<p>
						<AppLinkHelp page="dev-packages" class="link-help">
							<AppTranslate>Learn more about packages...</AppTranslate>
						</AppLinkHelp>
					</p>
				</div>
			</div>
			<div class="col-sm-8 col-sm-pull-4 col-md-7 col-md-pull-4 col-lg-8 col-lg-pull-4">
				<FormGamePackage :game="game" @submit="onPackageAdded" />
			</div>
		</div>
	</div>
</template>
