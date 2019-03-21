import { GameScoreTable } from 'game-jolt-frontend-lib/components/game/score-table/score-table.model';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { UserGameScore } from 'game-jolt-frontend-lib/components/user/game-score/game-score.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

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
