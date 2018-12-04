import View from '!view!./soundtrack.html';
import { AppAdWidget } from 'game-jolt-frontend-lib/components/ad/widget/widget';
import { Component } from 'vue-property-decorator';
import { AppAdPlacement } from '../../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { GameSong } from '../../../../../../../lib/gj-lib-client/components/game/song/song.model';
import { HistoryTick } from '../../../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppLoading } from '../../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { RouteStore, RouteStoreModule } from '../../view.store';

const DownloadDelay = 3000;

@View
@Component({
	name: 'RouteDiscoverGamesViewDownloadSoundtrack',
	components: {
		AppAdWidget,
		AppAdPlacement,
		AppLoading,
	},
})
@RouteResolver({
	deps: {},
	async resolver({ route }) {
		const gameId = parseInt(route.params.id, 10);

		HistoryTick.sendBeacon('game-soundtrack', gameId, {
			sourceResource: 'Game',
			sourceResourceId: gameId,
		});
	},
})
export default class RouteDiscoverGamesViewDownloadSoundtrack extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	src: string | null = null;

	readonly Screen = Screen;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Downloading soundtrack for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	async routeResolved() {
		// Don't download on SSR.
		if (GJ_IS_SSR) {
			return;
		}

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
