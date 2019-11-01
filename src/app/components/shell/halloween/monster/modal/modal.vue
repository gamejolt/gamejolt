<template>
	<app-modal>
		<div class="modal-body">
			<div class="-avatar">
				<img alt="monster" :src="avatar" />
			</div>
			<div class="-stats">
				<blockquote>
					<p>
						<em>"{{ pun }}"</em>
					</p>
					<footer>- {{ mood }}</footer>
				</blockquote>

				<div>
					<label>
						<app-jolticon icon="exp" />
						Your Stats
					</label>
					<span class="-caught" v-translate="{ caught: userBreakdown.current }">
						Caught:
						<b>%{ caught }</b>
					</span>
					<span v-translate="{ rank: userBreakdown.rank }">
						Rank:
						<b>%{ rank }</b>
					</span>
				</div>
				<app-progress-bar
					:percent="
						Math.min(
							((userBreakdown.current - userBreakdown.start) * 100) /
								(userBreakdown.end - userBreakdown.start),
							100
						)
					"
					active
				/>

				<div>
					<label>
						<app-jolticon icon="world" />
						Global stats
					</label>
					<span
						v-translate="{
							caught: globalBreakdown.current,
						}"
					>
						Caught:
						<b>%{ caught }</b>
					</span>
				</div>
				<app-progress-bar
					:percent="
						Math.min(
							((globalBreakdown.current - globalBreakdown.start) * 100) /
								(globalBreakdown.end - globalBreakdown.start),
							100
						)
					"
					indeterminate
					active
				/>

				<app-button
					primary
					outline
					icon="chart"
					:to="{ name: 'landing.halloween', hash: '#monster-stats' }"
				>
					<translate>Stats</translate>
				</app-button>
				<app-button class="-danger" trans icon="inactive" :to="{ name: 'settings' }">
					<translate>Opt Out</translate>
				</app-button>
				<app-button class="pull-right" trans icon="remove" @click="modal.dismiss()">
					<translate>Close</translate>
				</app-button>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-avatar
	float: left

	img
		width: 300px
		height: 300px
		filter: drop-shadow(0 0 10px rgb(255, 0, 0))

.-stats
	margin-left: 310px

	label
		width: 120px

	.-caught
		display: inline-block
		width: 90px

>>> .progress
	background-color: var(--theme-bg-offset)
	height: 40px

.-danger:hover
		change-bg('notice', true)
		border-color: var(--theme-notice) !important
		color: var(--theme-notice-fg) !important
</style>

<script lang="ts" src="./modal"></script>
