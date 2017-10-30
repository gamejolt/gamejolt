import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./feed.html?style=./feed.styl';

import { GameScoreTable } from '../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { ActivityStreamSubscription } from '../../../../lib/gj-lib-client/components/activity/stream/subscription.service';
import { ActivityStream } from '../../../../lib/gj-lib-client/components/activity/stream/stream.service';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';

@View
@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
	},
})
export class AppScoreFeed extends Vue {
	@Prop(GameScoreTable) scoreTable: GameScoreTable;

	latestScore: any | null = null;
	scores: any[] = [];

	private subscription?: ActivityStreamSubscription;

	@Watch('scoreTable.id', { immediate: true })
	onScoreTableChange() {
		// Only works in browser context.
		if (GJ_IS_SSR) {
			return;
		}

		this.closeSubscription();
		this.setupSubscription();
	}

	destroyed() {
		this.closeSubscription();
	}

	private processScore(score: any) {
		if (score.user) {
			const noAvatar = 'https://s.gjcdn.net/img/no-avatar-3.png';
			score.user.img_avatar =
				'https://secure.gravatar.com/avatar/' +
				score.user.email_hash +
				'?s=200&r=pg&d=' +
				encodeURIComponent(noAvatar);
		}

		score.time = new Date(score.time);
	}

	private async setupSubscription() {
		this.subscription = await ActivityStream.subscribe(
			'scores',
			{ tableId: this.scoreTable.id },
			(message: any) => this.messageHandler(message)
		);
	}

	private messageHandler(message: any) {
		if (!message.event) {
			return;
		}

		switch (message.event) {
			case 'new-scores':
				if (!message.scores || !message.scores.length) {
					return;
				}

				let latestScoreDate: Date | null = null;
				if (this.latestScore) {
					latestScoreDate = new Date(this.latestScore.time);
				}

				for (const score of message.scores) {
					const scoreDate = new Date(score.time);

					if (!latestScoreDate || scoreDate.getTime() > latestScoreDate.getTime()) {
						this.latestScore = score;

						this.processScore(score);
						this.scores.unshift(score);
					}
				}

				this.scores = this.scores.slice(0, 3);

				break;
		}
	}

	private closeSubscription() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}

		this.latestScore = null;
		this.subscription = undefined;
	}
}
