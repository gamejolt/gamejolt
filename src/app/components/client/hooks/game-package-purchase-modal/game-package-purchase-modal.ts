import type { GameBuildModel } from '../../../../../_common/game/build/build.model';
import type { GameModel } from '../../../../../_common/game/game.model';
import type { ClientLibraryStore } from '../../../../store/client-library';

export function makeDownloadPackageHook(store: ClientLibraryStore) {
	return (game: GameModel, build: GameBuildModel) => {
		store.packageInstall(game, build._package!, build._release!, build, build._launch_options!);
	};
}
