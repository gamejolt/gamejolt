import AppAdPlacement from 'game-jolt-frontend-lib/components/ad/placement/placement.vue';
import AppAdWidget from 'game-jolt-frontend-lib/components/ad/widget/widget.vue';
import { GameSong } from 'game-jolt-frontend-lib/components/game/song/song.model';
import { HistoryTick } from 'game-jolt-frontend-lib/components/history-tick/history-tick-service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../../view.store';

const DownloadDelay = 3000;

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
