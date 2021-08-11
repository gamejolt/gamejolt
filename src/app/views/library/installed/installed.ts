import { Options } from 'vue-property-decorator';
import AppAlertDismissable from '../../../../_common/alert/dismissable/dismissable.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
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
	@ClientLibraryState
	games!: ClientLibraryStore['games'];

	get gamesByTitle() {
		return this.games.sort((a, b) => {
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		});
	}

	routeCreated() {
		Meta.setTitle(this.$gettext('library.installed.page_title'));
	}
}
