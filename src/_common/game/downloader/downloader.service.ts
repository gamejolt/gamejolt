import { Environment } from '~common/environment/environment.service';
import { GameBuildModel } from '~common/game/build/build.model';
import { GameModel } from '~common/game/game.model';
import { showErrorGrowl } from '~common/growls/growls.service';
import { sendHistoryTick } from '~common/history-tick/history-tick-service';
import { Navigate } from '~common/navigate/navigate.service';
import { hideAllPoppers } from '~common/popper/popper.service';
import { getCurrentRouter } from '~common/route/current-router-service';
import { $gettext } from '~common/translate/translate.service';

export interface GameDownloaderOptions {
	key?: string;
	isOwned?: boolean;
}

class GameDownloaderService {
	isDownloadQueued = false;
	shouldTransition = false;

	async download(game: GameModel, build: GameBuildModel, options: GameDownloaderOptions = {}) {
		// In case any popover was used to click the download.
		hideAllPoppers();

		const router = getCurrentRouter();

		// Any time we transition away from the page, make sure we reset our
		// download transition. This will ensure the download won't start.
		let deregister: (() => void) | undefined = router.beforeEach((_to, _from, next) => {
			this.shouldTransition = false;
			if (deregister) {
				deregister();
				deregister = undefined;
			}
			next();
		});

		// Client needs to download externally.
		if (GJ_IS_DESKTOP_APP) {
			let urlPath = router.resolve({
				name: 'download',
				params: {
					type: 'build',
				},
				query: {
					game: game.id + '',
					build: build.id + '',
				},
			}).href;

			// When built, the client prepends urls with hashtag (#) that needs to be trimmed when going to external site.
			urlPath = urlPath.replace(/^#/, '');

			Navigate.gotoExternal(`${Environment.baseUrl}${urlPath}`);
		} else if (
			game.bundle_only ||
			options.key ||
			options.isOwned ||
			(build._package!._sellable && build._package!._sellable!.is_owned)
		) {
			// Bundle-only games can only live in a person's library, or as a key.
			// So if it's bundle-only, or if a key was passed in, go direct. Or, uh,
			// if it is owned.
			// If already waiting on a download, don't do anything.
			if (this.isDownloadQueued) {
				return;
			}

			try {
				// We set this to true and then check it later. If they've
				// navigated to a different route then it will be set to false
				// and we should no longer change their location.
				this.shouldTransition = true;

				// If they click away from the page before the download starts, then cancel the download redirect.
				const response = await build.getDownloadUrl({
					key: options.key || undefined,
					forceDownload: true,
				});

				const downloadUrl = response.url;

				// We await so that we're sure the tick has logged.
				await sendHistoryTick('game-build', build.id, {
					sourceResource: 'Game',
					sourceResourceId: game.id,
					key: options.key || undefined,
				});

				if (this.shouldTransition) {
					Navigate.goto(downloadUrl);
				}
			} catch (e) {
				showErrorGrowl($gettext(`Couldn't get download URL.`));
			}

			this.isDownloadQueued = false;
		} else {
			router.push({
				name: 'download',
				params: {
					type: 'build',
				},
				query: {
					game: game.id + '',
					build: build.id + '',
				},
			});
		}
	}
}

export const GameDownloader = /** @__PURE__ */ new GameDownloaderService();
