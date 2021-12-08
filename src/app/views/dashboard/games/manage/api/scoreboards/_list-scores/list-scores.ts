import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { formatDate } from '../../../../../../../../_common/filters/date';
import { formatNumber } from '../../../../../../../../_common/filters/number';
import { GameScoreTable } from '../../../../../../../../_common/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../_common/popper/popper.vue';
import { UserGameScore } from '../../../../../../../../_common/user/game-score/game-score.model';

@Options({
	components: {
		AppPopper,
	},
})
export default class AppManageGameListScores extends Vue {
	@Prop(GameScoreTable) scoreTable!: GameScoreTable;
	@Prop(Array) scores!: UserGameScore[];
	@Prop(Boolean) isForUser?: boolean;

	@Emit('remove')
	emitRemove(_score: UserGameScore) {}

	readonly date = formatDate;
	readonly number = formatNumber;

	async removeScore(score: UserGameScore) {
		const result = await ModalConfirm.show(
			this.$gettext('Are you sure you want to remove this score?')
		);

		if (!result) {
			return;
		}

		await score.$remove();

		this.emitRemove(score);
	}
}
