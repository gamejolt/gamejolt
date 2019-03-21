import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppJolticon,
	},
})
export default class AppGameDevStageConfirmModal extends BaseModal {
	@Prop(Game) game!: Game;
	@Prop(Number) stage!: number;

	from = '';
	to = '';
	action = '';

	fromTranslated = '';
	toTranslated = '';

	created() {
		this.from = this._getStatusString(this.game.development_status);
		this.to = this._getStatusString(this.stage);
		this.action = `${this.from}:${this.to}`;

		this.fromTranslated = this._getStatusTranslated(this.game.development_status);
		this.toTranslated = this._getStatusTranslated(this.stage);
	}

	private _getStatusTranslated(stage: number) {
		if (stage === Game.DEVELOPMENT_STATUS_DEVLOG) {
			return this.$gettext('devlog-only');
		} else if (stage === Game.DEVELOPMENT_STATUS_WIP) {
			return this.$gettext('early access');
		}

		return this.$gettext('complete');
	}

	private _getStatusString(stage: number) {
		if (stage === Game.DEVELOPMENT_STATUS_DEVLOG) {
			return 'devlog';
		} else if (stage === Game.DEVELOPMENT_STATUS_WIP) {
			return 'wip';
		}

		return 'complete';
	}

	proceed() {
		this.modal.resolve(true);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
