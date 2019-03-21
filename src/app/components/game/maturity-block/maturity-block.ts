import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Settings } from '../../../../_common/settings/settings.service';
import { Store } from '../../../store/index';
import AppGameOgrs from '../ogrs/ogrs.vue';


@Component({
	components: {
		AppGameOgrs,
	},
})
export default class AppGameMaturityBlock extends Vue {
	@Prop(Game) game!: Game;

	@State app!: Store['app'];

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
