import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./overview.html?style=./overview.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { GameScoreTable } from '../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { UserGameScore } from '../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppScoreList } from '../list/list';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppScoreboardSelector } from '../scoreboard-selector/scoreboard-selector';
import { AppScoreFeed } from '../feed/feed';

@View
@Component({
	components: {
		AppJolticon,
		AppTimeAgo,
		AppScoreboardSelector,
		AppScoreList,
		AppUserAvatar,
		AppScoreFeed,
	},
	directives: {
		AppPopoverTrigger,
	},
	filters: {
		number,
	},
})
export class AppScoreOverview extends Vue {
	@Prop(Game) game: Game;
	@Prop(Object) initialPayload?: any;
	@Prop({ type: String, default: 'full' })
	size: 'full' | 'small';

	@State app: AppStore;

	scoreTables: GameScoreTable[] = [];
	scoreTable: GameScoreTable | null = null;
	scores: UserGameScore[] = [];
	userBestScore: UserGameScore | null = null;
	userScorePlacement = 0;
	userScoreExperience = 0;

	Screen = makeObservableService(Screen);

	// Even.
	get scoresLeft() {
		return this.scores.filter((_score, i) => i % 2 === 0);
	}

	// Odd.
	get scoresRight() {
		return this.scores.filter((_score, i) => i % 2 === 1);
	}

	created() {
		if (this.initialPayload) {
			this.processPayload(this.initialPayload);
		} else {
			this.changeTable();
		}
	}

	@Watch('initialPayload')
	onChange() {
		if (this.initialPayload) {
			this.processPayload(this.initialPayload);
		}
	}

	private processPayload(payload: any) {
		this.scoreTables = payload.scoreTables ? GameScoreTable.populate(payload.scoreTables) : [];
		this.scoreTable = payload.scoreTable ? new GameScoreTable(payload.scoreTable) : null;
		this.scores = payload.scores ? UserGameScore.populate(payload.scores) : [];
		this.userBestScore = payload.scoresUserBestScore
			? new UserGameScore(payload.scoresUserBestScore)
			: null;
		this.userScorePlacement = payload.scoresUserScorePlacement || 0;
		this.userScoreExperience = payload.scoresUserScoreExperience || 0;
	}

	async changeTable(table?: GameScoreTable) {
		Popover.hideAll();

		// Only if not current table.
		if (table && this.scoreTable && table.id === this.scoreTable.id) {
			return;
		}

		let url = '/web/discover/games/scores/overview/' + this.game.id;
		if (table) {
			url += '/' + table.id;
		}

		const payload = await Api.sendRequest(url);
		this.processPayload(payload);
	}
}
