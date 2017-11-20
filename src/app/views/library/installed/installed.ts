import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./installed.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { Store } from '../../../store/index';
import { AppAlertDismissable } from '../../../../lib/gj-lib-client/components/alert/dismissable/dismissable';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLibraryInstalledGame } from './_game/game';
import { AppPageHeader } from '../../../components/page-header/page-header';

@View
@Component({
	name: 'RouteLibraryInstalled',
	components: {
		AppAlertDismissable,
		AppJolticon,
		AppPageHeader,
		AppLibraryInstalledGame,
	},
})
export default class RouteLibraryInstalled extends BaseRouteComponent {
	@State clientLibrary: Store['clientLibrary'];

	get games() {
		return this.clientLibrary.games;
	}

	get gamesByTitle() {
		return this.games.sort((a, b) => {
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		});
	}

	routeInit() {
		Meta.title = this.$gettext('library.installed.page_title');
	}
}
