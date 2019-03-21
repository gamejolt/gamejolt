<template>
	<div
		class="trophy-completion alert"
		:class="{
			'alert-dark': achieved > 0,
		}"
	>
		<template v-if="achieved > 0">
			<p>
				<span
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
			</p>
			<br />

			<app-progress-bar thin :percent="completionRate" />

			<div class="clearfix">
				<div class="pull-left">
					<div class="stat-big stat-big-smaller" style="margin-bottom: 0">
						<div class="stat-big-digit">{{ completionRate | number }}%</div>
						<div class="stat-big-label">
							<translate>trophies.completion.completion_label</translate>
						</div>
					</div>
				</div>
				<div class="pull-right">
					<div class="stat-big stat-big-smaller text-right" style="margin-bottom: 0">
						<div class="stat-big-digit">
							<app-jolticon icon="exp" class="text-muted" />
							{{ experience | number }}
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
	</div>
</template>

<script lang="ts" src="./completion" />
