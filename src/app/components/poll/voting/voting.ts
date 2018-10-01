import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./voting.html?style=./voting.styl';

import { Poll } from '../../../../lib/gj-lib-client/components/poll/poll.model';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { PollItem } from '../../../../lib/gj-lib-client/components/poll/item/item.model';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Store } from '../../../store';
import { State } from 'vuex-class';

@View
@Component({
	components: {
		AppProgressBar,
		AppTimeAgo,
	},
	directives: {
		AppAuthRequired,
	},
})
export class AppPollVoting extends Vue {
	@State
	app!: Store['app'];

	@Prop(Poll)
	poll!: Poll;

	@Prop(Game)
	game?: Game;

	@Prop(User)
	user?: User;

	chosenItemId: number | null = null;
	isProcessing = false;
	areResultsReady = false;
	now = Date.now();
	private dateRefresh: NodeJS.Timer | null = null;

	readonly number = number;

	get showResults() {
		return (
			(!this.isVotable && this.areResultsReady) ||
			this.votedId !== null ||
			(this.game && this.game.hasPerms()) ||
			(this.user && this.app.user && this.user.id === this.app.user.id)
		);
	}

	get votedId() {
		for (const item of this.poll.items) {
			if (item.is_voted) {
				return item.id;
			}
		}
		return null;
	}

	get isVotable() {
		return this.poll.end_time && this.poll.end_time > this.now;
	}

	mounted() {
		if (this.isVotable) {
			this.setInterval();
		} else {
			this.areResultsReady = true;
		}
	}

	destroyed() {
		this.clearInterval();
	}

	getItemPercentage(item: PollItem) {
		return (item.vote_count || 0) / Math.max(this.poll.vote_count, 1);
	}

	async vote(id: number) {
		if (this.isProcessing) {
			return;
		}

		this.isProcessing = true;
		await this.poll.$vote(id);
		this.isProcessing = false;
	}

	private clearInterval() {
		if (!GJ_IS_SSR) {
			if (this.dateRefresh) {
				clearInterval(this.dateRefresh);
				this.dateRefresh = null;
			}
		}
	}

	private setInterval() {
		if (!GJ_IS_SSR) {
			this.clearInterval();
			this.dateRefresh = setInterval(async () => {
				this.now = Date.now();
				if (!this.isVotable) {
					this.clearInterval();
					await this.poll.$refresh();
					this.areResultsReady = true;
				}
			}, 1000);
		}
	}
}
