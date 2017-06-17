import {
	Component,
	Inject,
	Input,
	Output,
	EventEmitter,
} from 'ng-metadata/core';
import * as template from '!html-loader!./dev-stage-selector.html';

import { FormDashboardGameDevStageSelectorConfirm } from './confirm-service';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';

@Component({
	selector: 'gj-form-dashboard-game-dev-stage-selector',
	template,
})
export class DevStageSelectorComponent {
	@Input('<') game: Game;

	@Output() private onSelect = new EventEmitter<number>();

	Game = Game;

	constructor(
		@Inject('FormDashboardGameDevStageSelectorConfirm')
		private confirm: FormDashboardGameDevStageSelectorConfirm,
		@Inject('gettextCatalog') private gettextCatalog: ng.gettext.gettextCatalog
	) {}

	select(stage: number) {
		if (this.onSelect) {
			this.onSelect.emit(stage);
		}

		if (!this.isEnabled(stage) || stage === this.game.development_status) {
			return;
		}

		this.confirm
			.show(this.game, stage)
			.then(() => this.game.$setDevStage(stage))
			.then(() => {
				Growls.success(
					this.gettextCatalog.getString(
						`Your game's development stage has been changed!`
					),
					this.gettextCatalog.getString('Stage Changed')
				);
			});
	}

	isEnabled(stage: number) {
		if (!this.game) {
			return true;
		}

		if (
			(stage === Game.DEVELOPMENT_STATUS_WIP ||
				stage === Game.DEVELOPMENT_STATUS_FINISHED) &&
			!this.game.has_active_builds
		) {
			return false;
		}
		return true;
	}
}
