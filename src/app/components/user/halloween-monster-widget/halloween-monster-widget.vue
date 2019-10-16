<template>
	<div class="halloween-monster-widget sheet" v-if="caughtAnything">
		<h4 class="-title">
			Halloween Monster Hunt
		</h4>
		<div class="-monster" v-for="monster of monsters" :key="monster.type">
			<img class="-avatar" :src="monster.imgUrl" />
			<div class="-details">
				<span class="-caught" v-translate="{ caught: number(monster.current) }">
					Caught:
					<b>%{ caught }</b>
				</span>
				<span v-translate="{ rank: monster.rank }">
					Rank:
					<b>%{ rank }</b>
				</span>
				<app-progress-bar
					:percent="
						Math.min(((monster.current - monster.start) * 100) / (monster.end - monster.start), 100)
					"
					thin
					active
					v-app-tooltip.bottom="
						monster.current < monster.end
							? $gettextInterpolate('%{ num } left for next rank', {
									num: monster.end - monster.current,
							  })
							: $gettext('A true spoopy master of no equal')
					"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.halloween-monster-widget
	margin-top: 25px

.-title
	text-align: center
	margin: 0
	margin-bottom: 15px

.-monster
	display: flex

	&:not(:last-child)
		margin-bottom: 10px

.-avatar
	img-circle()
	width: 50px
	height: 50px
	margin-right: 10px

.-details
	flex-grow: 1

.-caught
	display: inline-block
	width: 90px

>>> .progress
	width: 100%
	margin-top: 5px

</style>

<script lang="ts" src="./halloween-monster-widget"></script>
