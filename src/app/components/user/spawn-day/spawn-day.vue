<template>
	<app-alert-dismissable
		v-if="shouldShowSpawnDay"
		alert-type="info"
		:dismiss-key="`user-spawn-day-${user.id}-${spawnDayYear}`"
	>
		<div ref="container" class="-confetti-container"></div>

		<template v-if="isOwnSpawnDay">
			<h4>
				<span v-translate="{ username: user.display_name }">
					&nbsp;&nbsp; 🥳 &nbsp;&nbsp; You are celebrating your Spawn Day today!
				</span>
			</h4>

			<p v-translate="{ years: spawnDayYear }">
				That means on this day, you have been on Game Jolt for %{ years }!
			</p>
			<p>
				<translate>
					Tell your followers, let the world know!
				</translate>
			</p>
			<app-button @click="showNewPost">
				<translate>Celebrate</translate>
			</app-button>
		</template>
		<template v-else>
			<h4>
				<span v-translate="{ username: user.display_name }">
					&nbsp;&nbsp; 🥳 &nbsp;&nbsp; %{ username } is celebrating their Spawn Day!
				</span>
			</h4>

			<p v-translate="{ years: spawnDayYear }">
				That means on this day, they have been on Game Jolt for %{ years }!
			</p>
			<template v-if="user.shouts_enabled">
				<p>
					<translate>
						It is customary to wish them a happy Spawn Day, so you should too.
					</translate>
				</p>
				<app-button @click="showComments">
					<translate>Send your wishes</translate>
				</app-button>
			</template>
		</template>
	</app-alert-dismissable>
</template>

<style lang="stylus" scoped>
.-confetti-container
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	overflow: hidden
	pointer-events: none
	*
		pointer-events: none

</style>

<script lang="ts" src="./spawn-day"></script>
