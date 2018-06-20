import { namespace, State, Action, Mutation } from 'vuex-class';
import {
	VuexModule,
	VuexStore,
	VuexMutation,
	VuexAction,
} from '../../../../../lib/gj-lib-client/utils/vuex';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { GameScreenshot } from '../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameSketchfab } from '../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { router } from '../../../index';
import { GameCollaborator } from '../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';

export const RouteStoreName = 'manageRoute';
export const RouteState = namespace(RouteStoreName, State);
export const RouteAction = namespace(RouteStoreName, Action);
export const RouteMutation = namespace(RouteStoreName, Mutation);

const WizardKey = 'manage-game-wizard';

export type Media = GameScreenshot | GameVideo | GameSketchfab;

type Actions = {
	wizardNext: undefined;
	publish: undefined;
	saveDraft: undefined;
	hide: undefined;
	cancel: undefined;
	uncancel: undefined;
	removeGame: undefined;
	saveMediaSort: Media[];
};

type Mutations = {
	populate: any;
	populateMedia: any[];
	addMedia: (GameScreenshot | GameVideo | GameSketchfab)[];
	removeMedia: Media;
	updateMedia: Media[];
	finishWizard: undefined;
};

const STATE_PREFIX = 'dash.games.manage.game';

const TRANSITION_MAP: any = {
	details: 'description',
	description: 'design',
	design: 'packages.list',
	packages: 'maturity',
	maturity: 'music',
	music: 'settings',
	settings: 'wizard-finish',
};

const TRANSITION_MAP_DEVLOG: any = {
	details: 'description',
	description: 'design',
	design: 'maturity',
	maturity: 'settings',
	settings: 'wizard-finish',
};

function instantiateMediaItem(item: any) {
	if (item.media_type === 'image') {
		return new GameScreenshot(item);
	} else if (item.media_type === 'video') {
		return new GameVideo(item);
	} else if (item.media_type === 'sketchfab') {
		return new GameSketchfab(item);
	} else {
		throw new Error(`Invalid media item type.`);
	}
}

export function startWizard() {
	window.sessionStorage.setItem(WizardKey, 'active');
}

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, Actions, Mutations> {
	game: Game = null as any;
	collaboration: GameCollaborator | null = null;
	media: Media[] = [];
	isWizard = false;

	get canPublish() {
		if (!this.game) {
			return false;
		}

		if (!this.game.description_markdown) {
			return false;
		} else if (!this.game.thumbnail_media_item) {
			return false;
		} else if (!this.game.tigrs_age) {
			return false;
		} else if (!this.game._is_devlog && !this.game.has_active_builds) {
			return false;
		}

		return true;
	}

	get currentMediaSort() {
		if (!this.media) {
			return [];
		}

		return this.media.map((item: any) => {
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
	}

	@VuexMutation
	populate(payload: Mutations['populate']) {
		this.game = new Game(payload.game);
		this.collaboration = payload.collaboration
			? new GameCollaborator(payload.collaboration)
			: null;
		this.isWizard = !!window.sessionStorage.getItem(WizardKey);
	}

	@VuexMutation
	populateMedia(mediaItems: Mutations['populateMedia']) {
		this.media.splice(0, this.media.length);
		if (mediaItems && mediaItems.length) {
			for (const item of mediaItems) {
				this.media.push(instantiateMediaItem(item));
			}
		}
	}

	@VuexMutation
	addMedia(media: Mutations['addMedia']) {
		for (const item of media) {
			this.media.unshift(item);
		}
	}

	@VuexMutation
	removeMedia(item: Mutations['removeMedia']) {
		const index = this.media.findIndex(i => i.id === item.id);
		if (index !== -1) {
			this.media.splice(index, 1);
		}
	}

	@VuexMutation
	updateMedia(items: Mutations['updateMedia']) {
		this.media = items;
	}

	@VuexMutation
	finishWizard() {
		this.isWizard = false;
		window.sessionStorage.removeItem(WizardKey);
	}

	@VuexAction
	async wizardNext() {
		if (!this.game) {
			return;
		}

		let transitionMap = TRANSITION_MAP;
		if (this.game._is_devlog) {
			transitionMap = TRANSITION_MAP_DEVLOG;
		}

		const routeName = router.currentRoute.name!;
		for (const current in transitionMap) {
			if (routeName.indexOf(`${STATE_PREFIX}.${current}`) !== -1) {
				const next = transitionMap[current];
				router.push({
					name: `${STATE_PREFIX}.${next}`,
				});
				return;
			}
		}
	}

	@VuexAction
	async publish() {
		const result = await ModalConfirm.show(
			Translate.$gettext('dash.games.overview.publish_confirmation')
		);
		if (!result) {
			return;
		}

		await this.game.$setStatus(Game.STATUS_VISIBLE);

		Growls.success(
			Translate.$gettext('dash.games.overview.published_growl'),
			Translate.$gettext('dash.games.overview.published_growl_title')
		);

		this.finishWizard();

		router.push({
			name: 'dash.games.manage.game.overview',
			params: router.currentRoute.params,
		});
	}

	@VuexAction
	async saveDraft() {
		this.finishWizard();

		// Simply go to the overview and pull out of the wizard!
		router.push({
			name: 'dash.games.manage.game.overview',
			params: router.currentRoute.params,
		});
	}

	@VuexAction
	async hide() {
		const result = await ModalConfirm.show(
			Translate.$gettext('Are you sure you want to hide your game page?')
		);
		if (!result) {
			return;
		}

		await this.game.$setStatus(Game.STATUS_HIDDEN);

		Growls.info(
			Translate.$gettext('Your game page is now hidden.'),
			Translate.$gettext('Game Hidden')
		);
	}

	@VuexAction
	async cancel() {
		const result = await ModalConfirm.show(
			Translate.$gettext('Are you sure you want to cancel your game?')
		);
		if (!result) {
			return;
		}

		await this.game.$setCanceled(true);

		Growls.info(
			Translate.$gettext('Your game is now canceled.'),
			Translate.$gettext('Game Canceled')
		);
	}

	@VuexAction
	async uncancel() {
		const result = await ModalConfirm.show(
			Translate.$gettext('Are you sure you want to uncancel your game?')
		);
		if (!result) {
			return;
		}

		await this.game.$setCanceled(false);

		Growls.info(
			Translate.$gettext('Your game is no longer canceled.'),
			Translate.$gettext('Game Uncanceled')
		);
	}

	@VuexAction
	async removeGame() {
		const result = await ModalConfirm.show(
			Translate.$gettext('dash.games.remove_confirmation')
		);
		if (!result) {
			return;
		}

		await this.game.$remove();

		Growls.info(
			Translate.$gettext('dash.games.removed_growl'),
			Translate.$gettext('dash.games.removed_growl_title')
		);

		router.push({ name: 'dash.main.overview' });
	}

	@VuexAction
	async leaveProject() {
		if (!this.collaboration) {
			return;
		}

		const result = await ModalConfirm.show(
			Translate.$gettext(`Are you sure you want to leave this project?`),
			Translate.$gettext('Leave project?'),
			'yes'
		);

		if (!result) {
			return;
		}

		await this.collaboration.$remove();

		Growls.success(
			Translate.$gettext('You left the project. You will be missed! ;A;'),
			Translate.$gettext('Left Project')
		);

		router.push({ name: 'dash.main.overview' });
	}

	@VuexAction
	async saveMediaSort(items: Actions['saveMediaSort']) {
		this.updateMedia(items);

		await Api.sendRequest(
			'/web/dash/developer/games/media/save-sort/' + this.game.id,
			this.currentMediaSort
		);
	}
}
