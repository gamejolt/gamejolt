import View from '!view!./maturity-block.html?style=./maturity-block.styl';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { Settings } from '../../../../_common/settings/settings.service';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { Store } from '../../../store/index';
import { AppGameOgrs } from '../ogrs/ogrs';

@View
@Component({
	components: {
		AppGameOgrs,
	},
})
export class AppGameMaturityBlock extends Vue {
	@Prop(Game) game: Game;

	@State app: Store['app'];

	private hasBypassed = false;

	get shouldBlock() {
		return (
			this.game &&
			this.game.tigrs_age === 3 &&
			!GJ_IS_SSR &&
			Settings.get('restricted-browsing') &&
			!this.game.hasPerms() &&
			!this.hasBypassed
		);
	}

	@Watch('game', { immediate: true })
	onWatch(newGame: Game, oldGame?: Game) {
		if (!oldGame || newGame.id !== oldGame.id) {
			this.hasBypassed = false;
		}
	}

	proceed() {
		this.hasBypassed = true;
		Scroll.to(0, { animate: false });
		Analytics.trackEvent('restricted-browsing', 'unblock');
	}

	removeRestriction() {
		Settings.set('restricted-browsing', false);
		this.proceed();
	}
}
