import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GameDevStageSelectorConfirmModal } from './confirm-service';


@Component({
	components: {
		AppJolticon,
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

	async select(stage: number) {
		this.$emit('select', stage);

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
