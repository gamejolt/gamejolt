import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./music.html';

import { GameSong } from '../../../../../../../lib/gj-lib-client/components/game/song/song.model';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { RouteState, RouteStore } from '../../manage.store';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppCardList } from '../../../../../../../lib/gj-lib-client/components/card/list/list';
import { AppCardListItem } from '../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppCardListDraggable } from '../../../../../../../lib/gj-lib-client/components/card/list/draggable/draggable';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameSong } from '../../../../../../components/forms/game/song/song';
import { AppDashGameWizardControls } from '../../../../../../components/forms/game/wizard-controls/wizard-controls';
import { AppCardListAdd } from '../../../../../../../lib/gj-lib-client/components/card/list/add/add';
import { arrayRemove } from '../../../../../../../lib/gj-lib-client/utils/array';
import { AppLoadingFade } from '../../../../../../../lib/gj-lib-client/components/loading/fade/fade';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGameMusic',
	components: {
		FormGameSong,
		AppCardList,
		AppCardListItem,
		AppCardListDraggable,
		AppCardListAdd,
		AppJolticon,
		AppDashGameWizardControls,
		AppLoadingFade,
	},
})
export default class RouteDashGamesManageGameMusic extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	songs: GameSong[] = [];
	isAdding = false;
	isProcessing = false;
	activeItem: GameSong | null = null;

	get currentSort() {
		return this.songs.map(item => item.id);
	}

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/developer/games/music/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Manage Music for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routed() {
		this.songs = GameSong.populate(this.$payload.songs);
		this.isAdding = !this.songs.length;
	}

	onSongEdited() {
		this.activeItem = null;
	}

	onSongAdded(formModel: GameSong) {
		this.songs.push(new GameSong(formModel));
		this.isAdding = false;
	}

	saveSongSort(songs: GameSong[]) {
		this.songs = songs;
		GameSong.$saveSort(this.game.id, this.currentSort);
	}

	async removeSong(song: GameSong) {
		const result = await ModalConfirm.show(this.$gettext('dash.games.music.remove_confirmation'));

		if (!result) {
			return;
		}

		this.isProcessing = true;
		await song.$remove();
		arrayRemove(this.songs, i => i.id === song.id);
		this.isProcessing = false;
	}
}
