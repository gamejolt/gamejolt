<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { formatNumber } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import { PollItem } from '../../../../_common/poll/item/item.model';
import { Poll } from '../../../../_common/poll/poll.model';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { User } from '../../../../_common/user/user.model';

@Options({
	components: {
		AppProgressBar,
		AppTimeAgo,
	},
	directives: {
		AppAuthRequired: vAppAuthRequired,
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
</script>

<template>
	<div class="poll-voting">
		<template v-if="!showResults">
			<div class="form-group">
				<div v-for="item of poll.items" :key="item.id" class="radio">
					<label>
						<input
							v-model="chosenItemId"
							type="radio"
							:value="item.id"
							:disabled="isProcessing ? 'true' : undefined"
						/>
						{{ item.text }}
					</label>
				</div>
			</div>
		</template>
		<template v-else>
			<div
				v-for="item of poll.items"
				:key="item.id"
				:class="{
					'-chosen': item.is_voted,
				}"
			>
				<AppProgressBar :percent="getItemPercentage(item) * 100">
					<span v-if="!shouldObscureResults" class="-progress-percent">
						{{
							formatNumber(getItemPercentage(item), {
								style: 'percent',
								maximumFractionDigits: 0,
							})
						}}
					</span>

					{{ item.text }}
				</AppProgressBar>
			</div>

			<div v-if="poll.is_private" class="alert">
				<AppTranslate>The results of this poll are private.</AppTranslate>
			</div>
		</template>

		<div>
			<template v-if="!showResults">
				<span v-app-auth-required>
					<AppButton
						:disabled="!chosenItemId || isProcessing"
						@click="vote(chosenItemId!)"
					>
						<AppTranslate>Vote</AppTranslate>
					</AppButton>
				</span>
				&nbsp;
			</template>

			<span class="text-muted">
				<AppTranslate
					:translate-n="poll.vote_count || 0"
					:translate-params="{ votes: formatNumber(poll.vote_count || 0) }"
					translate-plural="%{ votes } votes"
				>
					%{ votes } vote
				</AppTranslate>

				<span class="dot-separator" />

				<AppTimeAgo v-if="isVotable" :date="poll.end_time" is-future />
				<AppTranslate v-else-if="poll.end_time">Voting finished</AppTranslate>
				<AppTranslate v-else>Draft poll</AppTranslate>
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-progress-percent
	display: inline-block
	width: 50px
	font-weight: bold
	margin-right: 10px
	text-align: right

.-chosen
	font-weight: bold
</style>
