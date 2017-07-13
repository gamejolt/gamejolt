import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./list-scores.html';
import { GameScoreTable } from '../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { UserGameScore } from '../../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { ModalConfirm } from '../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppJolticon } from '../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopover } from '../../../../../../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { date } from '../../../../../../../../lib/gj-lib-client/vue/filters/date';
import { number } from '../../../../../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
	},
	directives: {
		AppPopoverTrigger,
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

// angular
// 	.module('App.Views.Dashboard')
// 	.directive('gjDashListScoresDeveloper', function() {
// 		return {
// 			restrict: 'E',
// 			template: require('!html-loader!./list-scores.html'),
// 			scope: {},
// 			bindToController: {
// 				scoreTable: '=gjScoreTable',
// 				scores: '=gjScores',
// 				isForUser: '=?isForUser',
// 				onRemove: '&?',
// 			},
// 			controllerAs: 'ctrl',
// 			controller: function($scope, $state, ModalConfirm) {
// 				var _this = this;

// 				$scope.$state = $state;

// 				this.
// 				};
// 			},
// 		};
// 	});
