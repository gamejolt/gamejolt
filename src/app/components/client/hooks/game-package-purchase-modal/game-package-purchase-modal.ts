import type { GameBuild } from '../../../../../_common/game/build/build.model';
import type { Game } from '../../../../../_common/game/game.model';
import type { ClientLibraryStore } from '../../../../store/client-library';

export function makeDownloadPackageHook(store: ClientLibraryStore) {
	return (game: Game, build: GameBuild) => {
		store.packageInstall(game, build._package!, build._release!, build, build._launch_options!);
	};
}
