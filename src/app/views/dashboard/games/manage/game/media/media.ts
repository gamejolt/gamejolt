import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./media.html?style=./media.styl';

import { RouteState, RouteStore, RouteMutation, Media, RouteAction } from '../../manage.store';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Clipboard } from '../../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppNavTabList } from '../../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppCardList } from '../../../../../../../lib/gj-lib-client/components/card/list/list';
import { AppCardListItem } from '../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameImage } from '../../../../../../components/forms/game/image/image';
import { AppCardListDraggable } from '../../../../../../../lib/gj-lib-client/components/card/list/draggable/draggable';
import { FormGameVideo } from '../../../../../../components/forms/game/video/video';
import { FormGameSketchfab } from '../../../../../../components/forms/game/sketchfab/sketchfab';
import { AppDashGameWizardControls } from '../../../../../../components/forms/game/wizard-controls/wizard-controls';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGameMedia',
	components: {
		FormGameImage,
		FormGameVideo,
		FormGameSketchfab,
		AppNavTabList,
		AppCardList,
		AppCardListItem,
		AppCardListDraggable,
		AppJolticon,
		AppDashGameWizardControls,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDashGamesManageGameMedia extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];
	@RouteState media: RouteStore['media'];

	@RouteMutation populateMedia: RouteStore['populateMedia'];
	@RouteMutation addVideo: RouteStore['addVideo'];
	@RouteMutation addSketchfab: RouteStore['addSketchfab'];
	@RouteMutation addImages: RouteStore['addImages'];
	@RouteMutation removeMedia: RouteStore['removeMedia'];

	@RouteAction saveMediaSort: RouteStore['saveMediaSort'];

	tab: 'image' | 'video' | 'sketchfab' = 'image';
	activeItem: Media | null = null;

	Environment = Environment;
	Clipboard = Clipboard;

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/developer/games/media/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Manage Media for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routed($payload: any) {
		this.populateMedia($payload.mediaItems || []);
	}

	onImagesAdded(_model: any, response: any) {
		this.addImages(response.screenshots);
	}

	onMediaEdited() {
		this.activeItem = null;
	}

	async removeItem(item: Media) {
		let typeLabel = '';
		if (item.media_type === 'image') {
			typeLabel = this.$gettext('dash.games.media.image_label').toLowerCase();
		} else if (item.media_type === 'video') {
			typeLabel = this.$gettext('dash.games.media.video_label').toLowerCase();
		} else if (item.media_type === 'sketchfab') {
			typeLabel = this.$gettext('sketchfab model').toLowerCase();
		}

		/// {{ type }} contains the translated media item type (image/video/sketchfab)
		const message = this.$gettextInterpolate('Are you sure you want to remove this %{ type }?', {
			type: typeLabel,
		});

		const result = await ModalConfirm.show(message);
		if (!result) {
			return;
		}

		await item.$remove();

		this.removeMedia(item);
	}
}
