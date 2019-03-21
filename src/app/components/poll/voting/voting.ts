import { AppAuthRequired } from 'game-jolt-frontend-lib/components/auth/auth-required-directive';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { PollItem } from 'game-jolt-frontend-lib/components/poll/item/item.model';
import { Poll } from 'game-jolt-frontend-lib/components/poll/poll.model';
import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store';

@Component({
	components: {
		AppProgressBar,
		AppTimeAgo,
	},
	directives: {
		AppAuthRequired,
	},
})
export default class AppPollVoting extends Vue {
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
