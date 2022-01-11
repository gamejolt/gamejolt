import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { formatNumber } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import { PollItem } from '../../../../_common/poll/item/item.model';
import { Poll } from '../../../../_common/poll/poll.model';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { User } from '../../../../_common/user/user.model';

@Options({
	components: {
		AppProgressBar,
		AppTimeAgo,
	},
	directives: {
		AppAuthRequired,
	},
})
export default class AppPollVoting extends Vue {
	@Prop({ type: Object, required: true }) poll!: Poll;
	@Prop(Object) game?: Game;
	@Prop(Object) user?: User;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	chosenItemId: number | null = null;
	isProcessing = false;
	areResultsReady = false;
	now = Date.now();
	private dateRefresh: NodeJS.Timer | null = null;

	readonly formatNumber = formatNumber;

	get shouldObscureResults() {
		return this.poll.is_private && !this.isOwner;
	}

	get isOwner() {
		return this.user && this.app.user && this.user.id === this.app.user.id;
	}

	get showResults() {
		return (
			(!this.isVotable && this.areResultsReady) ||
			this.votedId !== null ||
			(this.game && this.game.hasPerms()) ||
			this.isOwner
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

	unmounted() {
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
		if (!import.meta.env.SSR) {
			if (this.dateRefresh) {
				clearInterval(this.dateRefresh);
				this.dateRefresh = null;
			}
		}
	}

	private setInterval() {
		if (!import.meta.env.SSR) {
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
