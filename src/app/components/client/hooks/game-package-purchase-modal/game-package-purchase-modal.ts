import type { ClientLibraryStore } from '~app/store/client-library';
import type { GameBuildModel } from '~common/game/build/build.model';
import type { GameModel } from '~common/game/game.model';

export function makeDownloadPackageHook(store: ClientLibraryStore) {
	return (game: GameModel, build: GameBuildModel) => {
		store.packageInstall(game, build._package!, build._release!, build, build._launch_options!);
	};
}
