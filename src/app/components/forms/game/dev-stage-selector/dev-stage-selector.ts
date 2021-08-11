import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../../_common/card/card.vue';
import { Game } from '../../../../../_common/game/game.model';
import { Growls } from '../../../../../_common/growls/growls.service';
import { GameDevStageSelectorConfirmModal } from './confirm-service';

@Options({
	components: {
		AppCard,
	},
})
export default class AppGameDevStageSelector extends Vue {
	@Prop(Game) game?: Game;

	stages = [
		Game.DEVELOPMENT_STATUS_DEVLOG,
		Game.DEVELOPMENT_STATUS_WIP,
		Game.DEVELOPMENT_STATUS_FINISHED,
	];

	Game = Game;

	@Emit('select')
	emitSelect(_stage: number) {}

	async select(stage: number) {
		this.emitSelect(stage);

		if (!this.game) {
			return;
		}

		if (!this.isEnabled(stage) || stage === this.game.development_status) {
			return;
		}

		const result = await GameDevStageSelectorConfirmModal.show(this.game, stage);
		if (result) {
			await this.game.$setDevStage(stage);
			Growls.success(
				this.$gettext(`Your game's development stage has been changed!`),
				this.$gettext('Stage Changed')
			);
		}
	}

	isEnabled(stage: number) {
		if (!this.game) {
			return true;
		}

		if (
			(stage === Game.DEVELOPMENT_STATUS_WIP || stage === Game.DEVELOPMENT_STATUS_FINISHED) &&
			!this.game.has_active_builds
		) {
			return false;
		}
		return true;
	}
}
