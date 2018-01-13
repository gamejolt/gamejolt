import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./voting.html?style=./voting.styl';

import { Poll } from '../../../../lib/gj-lib-client/components/poll/poll.model';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { PollItem } from '../../../../lib/gj-lib-client/components/poll/item/item.model';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';

@View
@Component({
	components: {
		AppProgressBar,
		AppJolticon,
		AppTimeAgo,
	},
})
export class AppPollVoting extends Vue {
	@Prop(Poll) poll: Poll;

	isProcessing = false;
	now = Date.now();
	private dateRefresh: NodeJS.Timer | null = null;

	readonly number = number;

	get showResults() {
		return !this.isVotable || this.votedId !== null;
	}

	get totalVotes() {
		let sum = 0;
		for (const item of this.poll.items) {
			sum += item.vote_count || 0;
		}
		return sum;
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
		return this.poll.end_time > this.now;
	}

	mounted() {
		this.setInterval();
	}

	destroyed() {
		this.clearInterval();
	}

	getItemPercentage(item: PollItem) {
		return (item.vote_count || 0) / Math.max(this.totalVotes, 1);
	}

	async vote(id: number) {
		if (this.isProcessing) {
			return;
		}

		this.isProcessing = true;
		this.poll.$vote(id);
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
			setInterval(() => (this.now = Date.now()), 1000);
		}
	}
}
