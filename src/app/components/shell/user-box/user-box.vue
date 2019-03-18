<template>
	<div class="user-box-exp">
		<div class="user-box-exp-stats">
			<div class="user-box-exp-stats-current">
				Level
				<em>{{ app.user.level }}</em>
				<span class="user-box-exp-stats-help">
					[
					<a href="https://help.gamejolt.com/user-exp" target="_blank">?</a>
					]
				</span>
			</div>
			<div class="user-box-exp-stats-next">
				Next in
				<strong>{{ app.user.experience_next | number }}</strong>
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

<style src="./user-box.styl" scoped />

<script lang="ts" src="./user-box" />
