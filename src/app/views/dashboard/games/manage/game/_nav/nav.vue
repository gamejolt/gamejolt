<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { GameModel } from '../../../../../../../_common/game/game.model';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { useGameDashRouteController } from '../../manage.store';
import AppManageGameNavRequired from './required.vue';

@Options({
	components: {
		AppManageGameNavRequired,
		AppGamePerms,
	},
})
export default class AppManageGameNav extends Vue {
	routeStore = setup(() => useGameDashRouteController()!);
	commonStore = setup(() => useCommonStore());

	get game() {
		return this.routeStore.game!;
	}

	get isWizard() {
		return this.routeStore.isWizard;
	}

	get canPublish() {
		return this.routeStore.canPublish;
	}

	get app() {
		return this.commonStore;
	}

	Game = GameModel;
}
</script>

<template>
	<div>
		<ul class="sans-margin game-dash-nav">
			<li v-if="!isWizard">
				<router-link
					:to="{
						name: 'dash.games.manage.game.overview',
						query: $route.query,
					}"
					exact-active-class="active"
				>
					<AppTranslate>Overview</AppTranslate>
				</router-link>
			</li>
			<AppGamePerms tag="li" required="builds,sales" :either="true">
				<router-link
					:to="{
						name: 'dash.games.manage.game.details',
						query: $route.query,
					}"
					active-class="active"
				>
					<AppManageGameNavRequired :is-complete="true" />
					<AppTranslate>Details</AppTranslate>
				</router-link>
			</AppGamePerms>
			<AppGamePerms tag="li" required="details,media" :either="true">
				<router-link
					:to="{
						name: 'dash.games.manage.game.description',
						query: $route.query,
					}"
					active-class="active"
				>
					<AppManageGameNavRequired :is-complete="game.hasDescription" />
					<AppTranslate>Description</AppTranslate>
				</router-link>
			</AppGamePerms>
			<AppGamePerms tag="li" required="media">
				<router-link
					:to="{
						name: 'dash.games.manage.game.design',
						query: $route.query,
					}"
					active-class="active"
				>
					<AppManageGameNavRequired :is-complete="!!game.thumbnail_media_item" />
					<AppTranslate>Design</AppTranslate>
				</router-link>
			</AppGamePerms>
			<AppGamePerms
				v-if="!isWizard || !game._is_devlog"
				tag="li"
				required="builds,sales"
				:either="true"
			>
				<router-link
					:to="{
						name: 'dash.games.manage.game.packages.list',
						query: $route.query,
					}"
					:class="{
						active:
							$route.name &&
							$route.name.indexOf('dash.games.manage.game.packages') === 0,
					}"
				>
					<AppManageGameNavRequired
						v-if="!game._is_devlog"
						:is-complete="game.has_active_builds"
					/>
					<AppTranslate>Packages</AppTranslate>
				</router-link>
			</AppGamePerms>
			<AppGamePerms tag="li" required="details">
				<router-link
					:to="{
						name: 'dash.games.manage.game.maturity',
						query: $route.query,
					}"
					active-class="active"
				>
					<AppManageGameNavRequired :is-complete="!!game.tigrs_age" />
					<AppTranslate>Maturity</AppTranslate>
				</router-link>
			</AppGamePerms>
			<AppGamePerms v-if="!isWizard" tag="li" required="music">
				<router-link
					:to="{
						name: 'dash.games.manage.game.music',
						query: $route.query,
					}"
					active-class="active"
				>
					<AppTranslate>Music</AppTranslate>
				</router-link>
			</AppGamePerms>
			<AppGamePerms v-if="!isWizard" tag="li">
				<router-link
					:to="{
						name: 'dash.games.manage.game.settings',
						query: $route.query,
					}"
					active-class="active"
				>
					<AppTranslate>Settings</AppTranslate>
				</router-link>
			</AppGamePerms>
		</ul>

		<AppGamePerms
			v-if="$route.name !== 'dash.games.manage.game.wizard-finish'"
			required="all"
			tag="div"
			class="hidden-xs"
		>
			<AppButton
				v-if="game.isUnlisted"
				primary
				block
				:disabled="!canPublish"
				@click="routeStore.publish()"
			>
				<AppTranslate>Publish</AppTranslate>
			</AppButton>

			<AppButton v-if="isWizard" primary block @click="routeStore.saveDraft()">
				<AppTranslate class="visible-lg">Save Draft</AppTranslate>
				<AppTranslate class="visible-md">Save</AppTranslate>
			</AppButton>
		</AppGamePerms>
	</div>
</template>

<style lang="stylus" scoped>
// Needed for the icons to show correctly.
.game-dash-nav
	li > a
		position: relative
</style>
