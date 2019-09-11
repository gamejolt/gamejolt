<template>
	<legend
		:class="{
			'-compact': compact,
			'-expandable': expandable,
			'-deletable': deletable,
		}"
	>
		<div class="-inner">
			<div class="-expander" v-if="expandable">{{ expanded ? `[-]` : `[+]` }}</div>
			<div class="-label"><slot /></div>
			<div class="-compactbar" v-if="compact" />
			<div class="-delete" v-if="deletable">
				<app-button sparse circle icon="remove" @click="emitDelete()" />
			</div>
		</div>
	</legend>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-compact
	position: relative
	font-size: $font-size-base
	border: 0

.-expandable
	cursor: pointer
	user-select: none

.-inner
	display: flex
	align-items: center

.-expander
	flex: none
	// This makes it so that the expander takes up the same amount of space.
	font-family: monospace

.-label
	flex: none

.-compactbar
	theme-prop('border-bottom-color', 'bg-subtle')
	flex: auto
	height: 1px
	border-bottom-width: 2px
	border-bottom-style: solid
	margin-left: 20px

.-delete
	flex: none
	margin-left: 20px
</style>

<script lang="ts" src="./legend"></script>
