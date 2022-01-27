<script lang="ts">
import { Options } from 'vue-property-decorator';
import AppAlertDismissable from '../../../../_common/alert/dismissable/dismissable.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import AppPageHeader from '../../../components/page-header/page-header.vue';
// import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
import AppLibraryInstalledGame from './_game/game.vue';

@Options({
	name: 'RouteLibraryInstalled',
	components: {
		AppAlertDismissable,
		AppPageHeader,
		AppLibraryInstalledGame,
	},
})
export default class RouteLibraryInstalled extends BaseRouteComponent {
	// @ClientLibraryState
	// games!: ClientLibraryStore['games'];
	games!: any;

	get gamesByTitle() {
		return this.games.sort((a, b) => {
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		});
	}

	routeCreated() {
		Meta.title = this.$gettext('Installed Games');
	}
}
</script>

<template>
	<div>
		<AppPageHeader>
			<h1><AppTranslate>Installed Games</AppTranslate></h1>
			<br />
		</AppPageHeader>

		<section class="section">
			<div class="container">
				<AppAlertDismissable alert-type="info" dismiss-key="library.install-location-msg">
					<AppJolticon icon="info-circle" />
					<AppTranslate
						translate-comment="Short message to remind them that they can change install location at any time in their settings."
					>
						You can change the location where games are installed at any time in your
						settings.
					</AppTranslate>
					<router-link :to="{ name: 'settings' }">
						<AppTranslate>Go to Settings?</AppTranslate>
					</router-link>
				</AppAlertDismissable>

				<div v-if="!games.length" class="alert alert-notice">
					<AppTranslate
						translate-comment="The message shown when there are no games installed yet in their library."
					>
						Your installed games show up here... that is, once you have some!
					</AppTranslate>
				</div>
				<div v-else class="row">
					<div v-for="game of gamesByTitle" :key="game.id" class="col-md-6 col-lg-4">
						<AppLibraryInstalledGame :game="game" />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
