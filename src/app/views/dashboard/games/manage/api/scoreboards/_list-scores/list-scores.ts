import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { date } from '../../../../../../../../_common/filters/date';
import { number } from '../../../../../../../../_common/filters/number';
import { GameScoreTable } from '../../../../../../../../_common/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../_common/popper/popper.vue';
import { UserGameScore } from '../../../../../../../../_common/user/game-score/game-score.model';

@Component({
	components: {
		AppPopper,
	},
	filters: {
		date,
		number,
	},
})
export default class AppManageGameListScores extends Vue {
	@Prop(GameScoreTable) scoreTable!: GameScoreTable;
	@Prop(Array) scores!: UserGameScore[];
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
