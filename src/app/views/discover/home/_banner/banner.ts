import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./banner.html?style=./banner.styl';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Store } from '../../../../../site-editor/store/index';
import { AppGameFollowWidget } from '../../../../components/game/follow-widget/follow-widget';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';

@View
@Component({
	components: {
		AppJolticon,
		AppGameFollowWidget,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverHomeBanner extends Vue {
	@Prop(Game) game: Game;

	@State app: Store['app'];

	img = 'https://n3b6p5n5.ssl.hwcdn.net/data/fireside/posts/0/48/5548/media/coma_logo_white-small-dxystxur.png';
	backImg = 'https://n3b6p5n5.ssl.hwcdn.net/data/fireside/posts/0/48/5548/media/onceuponacoma_gamejoltbanner-cropped-q98gsi2v.jpg';

	readonly Screen = makeObservableService(Screen);

	get shouldShowFollow() {
		return this.app.user && !this.game.is_following && this.app.user.id !== this.game.developer.id;
	}
}
