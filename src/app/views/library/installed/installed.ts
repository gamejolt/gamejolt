import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./installed.html';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { State } from 'vuex-class';
import {
	RouteResolve,
	BaseRouteComponent,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Store } from '../../../store/index';
import { arrayGroupBy } from '../../../../lib/gj-lib-client/utils/array';
import { AppGameThumbnail } from '../../../components/game/thumbnail/thumbnail';
import { AppClientGameButtons } from '../../../components/client/game-buttons/game-buttons';
import { AppAlertDismissable } from '../../../../lib/gj-lib-client/components/alert/dismissable/dismissable';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	name: 'RouteLibraryInstalled',
	components: {
		AppAlertDismissable,
		AppJolticon,
		AppGameThumbnail,
		AppClientGameButtons,
	},
})
export default class RouteLibraryInstalled extends BaseRouteComponent {
	@State clientLibrary: Store['clientLibrary'];

	isHovering = false;
	isShowingOptions = false;
	isShowingLaunchOptions = false;

	get games() {
		return this.clientLibrary.games;
	}

	get packagesByGameId() {
		return this.clientLibrary.packagesByGameId;
	}

	get gamesByTitle() {
		return this.games.sort((a, b) => {
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		});
	}

	get installingGames() {
		const packages = this.clientLibrary.packages.filter(localPackage => {
			return !!localPackage.install_state;
		});
		return arrayGroupBy(packages, 'game_id');
	}

	get updatingGames() {
		const packages = this.clientLibrary.packages.filter(localPackage => {
			return !!localPackage.update_state;
		});
		return arrayGroupBy(packages, 'game_id');
	}

	routeInit() {
		Meta.title = this.$gettext('library.installed.page_title');
	}

	@RouteResolve()
	async routeResolve(this: undefined, _route: VueRouter.Route) {}
}
