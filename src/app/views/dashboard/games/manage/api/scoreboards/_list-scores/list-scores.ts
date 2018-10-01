import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./list-scores.html';

import { GameScoreTable } from '../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { UserGameScore } from '../../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { ModalConfirm } from '../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppJolticon } from '../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../../../../../../../../lib/gj-lib-client/vue/filters/date';
import { number } from '../../../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppPopper } from '../../../../../../../../lib/gj-lib-client/components/popper/popper';

@View
@Component({
	components: {
		AppJolticon,
		AppPopper,
	},
	filters: {
		date,
		number,
	},
})
export class AppManageGameListScores extends Vue {
	@Prop(GameScoreTable) scoreTable: GameScoreTable;
	@Prop(Array) scores: UserGameScore[];
	@Prop(Boolean) isForUser?: boolean;

	async removeScore(score: UserGameScore) {
		const result = await ModalConfirm.show(
			this.$gettext('Are you sure you want to remove this score?')
		);

		if (!result) {
			return;
		}

		await score.$remove();

		this.$emit('remove', score);
	}
}
