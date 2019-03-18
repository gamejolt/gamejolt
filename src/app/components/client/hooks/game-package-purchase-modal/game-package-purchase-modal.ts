import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import { GameBuild } from 'game-jolt-frontend-lib/components/game/build/build.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Store } from '../../../../store/index';

export function hookDownloadPackage(store: Store, game: Game, build: GameBuild) {
	Analytics.trackEvent('game-package-card', 'install');
	store.dispatch('clientLibrary/packageInstall', [
		game,
		build._package!,
		build._release!,
		build,
		build._launch_options!,
	]);
}
