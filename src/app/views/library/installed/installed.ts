import AppAlertDismissable from 'game-jolt-frontend-lib/components/alert/dismissable/dismissable.vue';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
import AppLibraryInstalledGame from './_game/game.vue';

@Component({
	name: 'RouteLibraryInstalled',
	components: {
		AppAlertDismissable,
		AppPageHeader,
		AppLibraryInstalledGame,
	},
})
export default class RouteLibraryInstalled extends BaseRouteComponent {
	@ClientLibraryState
	games!: ClientLibraryStore['games'];

	get gamesByTitle() {
		return this.games.sort((a, b) => {
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		});
	}

	routeCreated() {
		Meta.title = this.$gettext('library.installed.page_title');
	}
}
