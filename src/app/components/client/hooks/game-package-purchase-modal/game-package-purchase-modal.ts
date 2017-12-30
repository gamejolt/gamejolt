import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { Analytics } from '../../../../../lib/gj-lib-client/components/analytics/analytics.service';
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
