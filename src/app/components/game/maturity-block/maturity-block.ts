import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { Game } from '../../../../_common/game/game.model';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { SettingRestrictedBrowsing } from '../../../../_common/settings/settings.service';
import { Store } from '../../../store/index';
import AppGameOgrs from '../ogrs/ogrs.vue';

@Options({
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
			!import.meta.env.SSR &&
			SettingRestrictedBrowsing.get() &&
			!this.game.is_following &&
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
		SettingRestrictedBrowsing.set(false);
		this.proceed();
	}
}
