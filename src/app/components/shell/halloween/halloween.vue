<template>
	<div class="-overlay" :class="{ 'is-in-combat': isInCombat }" @mousemove="mouseMove">
		<div ref="container" class="-overlay-content">
			<app-shell-halloween-monster
				v-for="(encounter, index) of HalloweenMonster.encounters"
				:key="index"
				:encounter="encounter"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-overlay
	position: fixed
	top: 0
	right: 0
	bottom: 0
	left: 0
	background-color: rgba(0, 0, 0, 0)
	pointer-events: none
	z-index: 200

	&.is-in-combat
		pointer-events: all
		background-color: rgba(0, 0, 0, 0.5)

.-overlay-content
	position: relative
	width: 100%
	height: 100%
</style>

<script lang="ts" src="./halloween"></script>
