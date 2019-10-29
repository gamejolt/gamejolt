<template>
	<div
		v-if="monster"
		class="overlay-monster select-disable"
		:style="{
			left: monster.pos.x + 'px',
			top: monster.pos.y + 'px',
			width: monster.size * monster.width + 'px',
			height: monster.size * monster.height + 'px',
		}"
	>
		<img
			class="select-disable"
			:class="'monster-type-' + monster.model.type"
			:src="monster.img"
			:style="{
				width: monster.size * monster.width + 'px',
				height: monster.size * monster.height + 'px',
				opacity: monster.opacity,
				webkitTransform: monsterTransform,
				transform: monsterTransform,
				mozTransform: monsterTransform,
				msTransform: monsterTransform,
				oTransform: monsterTransform,
			}"
			@click="interact"
			:draggable="false"
		/>

		<div
			class="overlay-monster-healthbar"
			:style="{
				width: monster.health * 100 + '%',
				height: '5%',
				backgroundColor: '#ff9423',
				visibility: healthbarVisibility,
			}"
		></div>
	</div>
</template>

<style lang="stylus" scoped>
.overlay-monster
	position: absolute
	pointer-events: all

	img
		cursor: pointer
		filter: drop-shadow(0 0 4px rgb(255, 120, 0))

.overlay-monster-healthbar
	border-style: solid
	border-color: black
	border-width: 1px
	border-radius: 2px

.select-disable
	-webkit-user-select: none
	-khtml-user-select: none
	-moz-user-select: none
	-o-user-select: none
	user-select: none
</style>

<script lang="ts" src="./monster"></script>
