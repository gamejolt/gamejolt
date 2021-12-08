<template>
	<div class="user-box-exp">
		<div class="user-box-exp-stats">
			<div class="user-box-exp-stats-current">
				Level
				<em>{{ app.user.level }}</em>
				<span class="user-box-exp-stats-help">
					[
					<app-link-help page="user-exp"> ? </app-link-help>
					]
				</span>
			</div>
			<div class="user-box-exp-stats-next">
				Next in
				<strong>{{ number(app.user.experience_next) }}</strong>
				EXP
			</div>
		</div>
		<div class="user-box-exp-progress">
			<app-jolticon icon="exp" />
			<app-progress-bar
				thin
				:percent="app.user.level_next_percentage"
				v-app-tooltip="`${app.user.level_next_percentage}% progress to next level`"
			/>
			<!-- <div class="progress progress-thin progress-green"
			>
			<div class="progress-bar" :style="{ width: app.user.level_next_percentage + '%' }"></div>
		</div> -->
		</div>
	</div>
</template>

<style lang="stylus" src="./user-box.styl" scoped></style>

<script lang="ts" src="./user-box"></script>
