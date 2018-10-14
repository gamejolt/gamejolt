import View from '!view!./installed.html';
import { Component } from 'vue-property-decorator';
import { AppAlertDismissable } from '../../../../lib/gj-lib-client/components/alert/dismissable/dismissable';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
import { AppLibraryInstalledGame } from './_game/game';

@View
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
