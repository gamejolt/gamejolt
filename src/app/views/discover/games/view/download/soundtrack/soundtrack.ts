import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./soundtrack.html';

import { HistoryTick } from '../../../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../view.store';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { GameSong } from '../../../../../../../lib/gj-lib-client/components/game/song/song.model';
import { AppLoading } from '../../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppAdPlacement } from '../../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';

const DownloadDelay = 3000;

@View
@Component({
	components: {
		AppAd,
		AppAdPlacement,
		AppLoading,
	},
})
export default class RouteDiscoverGamesViewDownloadSoundtrack extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	src: string | null = null;

	Screen = makeObservableService(Screen);

	@RouteResolve()
	async routeResolve(this: undefined, route: VueRouter.Route) {
		const gameId = parseInt(route.params.id, 10);

		HistoryTick.sendBeacon('game-soundtrack', gameId, {
			sourceResource: 'Game',
			sourceResourceId: gameId,
		});
	}

	async routed() {
		Meta.title = this.$gettextInterpolate(`Downloading soundtrack for %{ game }`, {
			game: this.game.title,
		});

		// Wait for view so we can scroll.
		await this.$nextTick();

		// Scroll down past the header.
		Scroll.to('page-ad-scroll');

		// We do it like this so that we start getting the download URL right
		// away while still waiting for the timeout.
		const data = await Promise.all<any>([
			GameSong.getSoundtrackDownloadUrl(this.game.id),

			// Wait at least this long before spawning the download.
			this.timeout(),
		]);

		this.src = data[0].downloadUrl;
	}

	private async timeout() {
		return new Promise(resolve => {
			setTimeout(resolve, DownloadDelay);
		});
	}
}
