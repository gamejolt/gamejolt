<script lang="ts" src="./voting"></script>

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
							:disabled="isProcessing"
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
				<app-progress-bar :percent="getItemPercentage(item) * 100">
					<span v-if="!shouldObscureResults" class="-progress-percent">
						{{
							number(getItemPercentage(item), {
								style: 'percent',
								maximumFractionDigits: 0,
							})
						}}
					</span>

					{{ item.text }}
				</app-progress-bar>
			</div>

			<div v-if="poll.is_private" class="alert">
				<translate>The results of this poll are private.</translate>
			</div>
		</template>

		<div>
			<template v-if="!showResults">
				<span v-app-auth-required>
					<app-button
						:disabled="!chosenItemId || isProcessing"
						@click="vote(chosenItemId)"
					>
						<translate>Vote</translate>
					</app-button>
				</span>
				&nbsp;
			</template>

			<span class="text-muted">
				<translate
					:translate-n="poll.vote_count || 0"
					:translate-params="{ votes: number(poll.vote_count || 0) }"
					translate-plural="%{ votes } votes"
				>
					%{ votes } vote
				</translate>

				<span class="dot-separator" />

				<app-time-ago v-if="isVotable" :date="poll.end_time" is-future />
				<translate v-else-if="poll.end_time">Voting finished</translate>
				<translate v-else>Draft poll</translate>
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
