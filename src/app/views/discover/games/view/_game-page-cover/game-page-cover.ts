import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./game-page-cover.html?style=./game-page-cover.styl';

import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { MediaItem } from '../../../../../../lib/gj-lib-client/components/media-item/media-item-model';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../../../../lib/gj-lib-client/components/time/ago/ago';
import { date } from '../../../../../../lib/gj-lib-client/vue/filters/date';
import { AppGameOgrsTag } from '../../../../../components/game/ogrs/tag';
import { AppGamePlaylistAddToPopover } from '../../../../../components/game-playlist/add-to-popover/add-to-popover';
import { AppGameFollowWidget } from '../../../../../components/game/follow-widget/follow-widget';
import { AppState } from '../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppTooltip } from '../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppAuthRequired } from '../../../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTrackEvent } from '../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppGameOgrs } from '../../../../../components/game/ogrs/ogrs';
import { AppMeter } from '../../../../../../lib/gj-lib-client/components/meter/meter';

@View
@Component({
	components: {
		AppJolticon,
		AppTimeAgo,
		AppGameOgrsTag,
		AppGameOgrs,
		AppMeter,
		AppGamePlaylistAddToPopover,
		AppGameFollowWidget,
	},
	directives: {
		AppTooltip,
		AppAuthRequired,
		AppTrackEvent,
		AppPopoverTrigger,
	},
	filters: {

	},
})
export class AppGamePageCover extends Vue
{
	@Prop( Game ) game: Game;

	@State app: AppState;

	coverMediaItem: MediaItem | null = null;

	date = date;
	Game = Game;

	created()
	{
		this.coverMediaItem = this.game.header_media_item || null;
	}
}
