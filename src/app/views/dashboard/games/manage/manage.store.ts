import { computed, inject, InjectionKey, provide, ref, unref } from 'vue';
import { Router } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { CollaboratorModel } from '../../../../../_common/collaborator/collaborator.model';
import { GameModel, GameStatus } from '../../../../../_common/game/game.model';
import { GameScreenshotModel } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfabModel } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameVideoModel } from '../../../../../_common/game/video/video.model';
import { showInfoGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../utils/array';

const Key: InjectionKey<GameDashRouteController> = Symbol('game-dash-route');
const WizardKey = 'manage-game-wizard';
export const ManageGameThemeKey = 'game-dash';

const StatePrefix = 'dash.games.manage.game';

const TransitionMap: any = {
	details: 'description',
	description: 'design',
	design: 'packages.list',
	packages: 'maturity',
	maturity: 'wizard-finish',
};

const TransitionMapDevlog: any = {
	details: 'description',
	description: 'design',
	design: 'maturity',
	maturity: 'wizard-finish',
};

export type GameDashRouteController = ReturnType<typeof createGameDashRouteController>;
export type Media = GameScreenshotModel | GameVideoModel | GameSketchfabModel;

export function useGameDashRouteController() {
	return inject(Key, null);
}

export function provideGameDashRouteController(c: GameDashRouteController) {
	provide(Key, c);
}

export function startWizard() {
	window.sessionStorage.setItem(WizardKey, 'active');
}

export function createGameDashRouteController({ router }: { router: Router }) {
	const game = ref<GameModel>();
	const collaboration = ref<CollaboratorModel>();
	const media = ref<Media[]>([]);
	const isWizard = ref(false);

	const canPublish = computed(() => {
		const _game = unref(game);
		if (!_game) {
			return false;
		}

		if (!_game.hasDescription) {
			return false;
		} else if (!_game.thumbnail_media_item) {
			return false;
		} else if (!_game.tigrs_age) {
			return false;
		} else if (!_game._is_devlog && !_game.has_active_builds) {
			return false;
		}

		return true;
	});

	const currentMediaSort = computed(() => {
		if (!media.value) {
			return [];
		}

		return media.value.map((item: any) => {
			if (item.media_type === 'image') {
				return 'screenshot-' + item.id;
			} else if (item.media_type === 'video') {
				return 'video-' + item.id;
			} else if (item.media_type === 'sketchfab') {
				return 'sketchfab-' + item.id;
			} else {
				throw new Error(`Invalid type.`);
			}
		});
	});

	function _instantiateMediaItem(item: any) {
		if (item.media_type === 'image') {
			return new GameScreenshotModel(item);
		} else if (item.media_type === 'video') {
			return new GameVideoModel(item);
		} else if (item.media_type === 'sketchfab') {
			return new GameSketchfabModel(item);
		} else {
			throw new Error(`Invalid media item type.`);
		}
	}

	function populate(payload: any) {
		game.value = new GameModel(payload.game);
		collaboration.value = payload.collaboration
			? new CollaboratorModel(payload.collaboration)
			: undefined;
		isWizard.value = !!window.sessionStorage.getItem(WizardKey);
	}

	function populateMedia(mediaItems: any[]) {
		media.value.splice(0, media.value.length);
		if (mediaItems && mediaItems.length) {
			for (const item of mediaItems) {
				media.value.push(_instantiateMediaItem(item));
			}
		}
	}

	function addMedia(newMedia: Media[]) {
		for (const item of newMedia) {
			media.value.unshift(item);
		}
	}

	function removeMedia(item: Media) {
		arrayRemove(media.value, i => i.id === item.id);
	}

	function updateMedia(items: Media[]) {
		media.value = items;
	}

	function finishWizard() {
		isWizard.value = false;
		window.sessionStorage.removeItem(WizardKey);
	}

	async function wizardNext() {
		if (!game.value) {
			return;
		}

		let transitionMap = TransitionMap;
		if (game.value._is_devlog) {
			transitionMap = TransitionMapDevlog;
		}

		const routeName = router.currentRoute.value.name!;
		for (const current in transitionMap) {
			if (
				typeof routeName === 'string' &&
				routeName.indexOf(`${StatePrefix}.${current}`) !== -1
			) {
				const next = transitionMap[current];
				router.push({
					name: `${StatePrefix}.${next}`,
				});
				return;
			}
		}
	}

	async function publish() {
		const result = await showModalConfirm(
			$gettext(
				`Publishing your game makes it visible on the site, so make sure your game page is lookin' good!`
			)
		);
		if (!result) {
			return;
		}

		await game.value!.$setStatus(GameStatus.Visible);

		showSuccessGrowl(
			$gettext(
				`You've published your game to the site! Huzzah! Remember to spread the word...`
			),
			$gettext('Game Published')
		);

		finishWizard();

		router.push({
			name: 'dash.games.manage.game.overview',
			params: router.currentRoute.value.params,
		});
	}

	async function saveDraft() {
		finishWizard();

		// Simply go to the overview and pull out of the wizard!
		router.push({
			name: 'dash.games.manage.game.overview',
			params: router.currentRoute.value.params,
		});
	}

	async function hide() {
		const result = await showModalConfirm(
			$gettext('Are you sure you want to unlist your game page?')
		);
		if (!result) {
			return;
		}

		await game.value!.$setStatus(GameStatus.Hidden);

		showInfoGrowl($gettext('Your game page is now unlisted.'), $gettext('Game Unlisted'));
	}

	async function cancel() {
		const result = await showModalConfirm(
			$gettext('Are you sure you want to cancel your game?')
		);
		if (!result) {
			return;
		}

		await game.value!.$setCanceled(true);

		showInfoGrowl($gettext('Your game is now canceled.'), $gettext('Game Canceled'));
	}

	async function uncancel() {
		const result = await showModalConfirm(
			$gettext('Are you sure you want to uncancel your game?')
		);
		if (!result) {
			return;
		}

		await game.value!.$setCanceled(false);

		showInfoGrowl($gettext('Your game is no longer canceled.'), $gettext('Game Uncanceled'));
	}

	async function removeGame() {
		const result = await showModalConfirm(
			$gettext('Are you sure you want to permanently remove your game?')
		);

		if (!result) {
			return;
		}

		await game.value!.$remove();

		showInfoGrowl(
			$gettext(
				'Your game has been removed from the site. Maybe a phoenix will rise in its place one day.'
			),
			$gettext('Game Removed')
		);

		router.push({ name: 'home' });
	}

	async function leaveProject() {
		if (!collaboration.value) {
			return;
		}

		const result = await showModalConfirm(
			$gettext(`Are you sure you want to leave this project?`),
			$gettext('Leave project?')
		);

		if (!result) {
			return;
		}

		await collaboration.value.$remove();

		showSuccessGrowl(
			$gettext('You left the project. You will be missed! ;A;'),
			$gettext('Left Project')
		);

		router.push({ name: 'home' });
	}

	async function saveMediaSort(items: Media[]) {
		updateMedia(items);

		await Api.sendRequest(
			'/web/dash/developer/games/media/save-sort/' + game.value!.id,
			currentMediaSort.value
		);
	}

	const c = {
		game,
		collaboration,
		media,
		isWizard,
		canPublish,
		currentMediaSort,
		populate,
		populateMedia,
		addMedia,
		removeMedia,
		updateMedia,
		finishWizard,
		wizardNext,
		publish,
		saveDraft,
		hide,
		cancel,
		uncancel,
		removeGame,
		leaveProject,
		saveMediaSort,
	};

	provideGameDashRouteController(c);
	return c;
}
