import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { Game } from '../../../../../_common/game/game.model';
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
