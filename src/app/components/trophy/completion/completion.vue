<script lang="ts" src="./completion"></script>

<template>
	<app-card class="trophy-completion">
		<template v-if="achieved > 0">
			<p>
				<span
					v-if="isLoggedInUser"
					v-translate="{
						achieved: number(achieved),
						total: number(total),
					}"
				>
					You've achieved
					<b>%{ achieved }</b>
					trophies out of a possible
					<b>%{ total }</b>
					.
				</span>
				<span
					v-else
					v-translate="{
						achieved: number(achieved),
						total: number(total),
					}"
				>
					They've achieved
					<b>%{ achieved }</b>
					trophies out of a possible
					<b>%{ total }</b>
					.
				</span>
			</p>
			<br />

			<app-progress-bar thin :percent="completionRate" />

			<div class="clearfix">
				<div class="pull-left">
					<div class="stat-big stat-big-smaller" style="margin-bottom: 0">
						<div class="stat-big-digit">{{ number(completionRate) }}%</div>
						<div class="stat-big-label">
							<translate>trophies.completion.completion_label</translate>
						</div>
					</div>
				</div>
				<div class="pull-right">
					<div class="stat-big stat-big-smaller text-right" style="margin-bottom: 0">
						<div class="stat-big-digit">
							<app-jolticon icon="exp" class="text-muted" />
							{{ number(experience) }}
						</div>
						<div class="stat-big-label">
							<translate>trophies.completion.exp_gained_label</translate>
						</div>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<translate>You haven't achieved any trophies for this game yet!</translate>
		</template>
	</app-card>
</template>
