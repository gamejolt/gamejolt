<template>
	<form class="game-filtering-input" @submit.prevent="sendSearch">
		<app-jolticon icon="filter" />

		<transition>
			<a class="anim-fade-enter anim-fade-leave" @click="clear" v-if="query">
				<app-jolticon icon="remove" />
			</a>
		</transition>

		<input
			ref="input"
			type="search"
			class="form-control"
			:placeholder="$gettext('games.filtering.input_placeholder')"
			v-model="query"
			@blur="sendSearch"
			@keydown.esc.stop.prevent="blur"
		/>
	</form>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.game-filtering-input
	position: relative

	> input
		padding-left: 32px
		padding-right: 32px

	> .jolticon
		theme-prop('color', 'lighter')
		position: absolute
		top: 9px
		left: 9px

	> a
		theme-prop('color', 'lighter')
		position: absolute
		top: 6px
		right: 7px

		&:hover
			color: $black
</style>

<script lang="ts" src="./input" />
