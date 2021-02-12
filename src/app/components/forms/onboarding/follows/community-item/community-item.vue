<script lang="ts" src="./community-item"></script>

<template>
	<div class="-item">
		<div class="-pressy">
			<div class="-wrapper">
				<app-community-thumbnail-img
					class="-img"
					:style="{
						'border-color': community.is_member ? highlight : '',
					}"
					:community="community"
					@click.native="toggleJoin"
				/>

				<div
					v-if="community.is_member"
					class="-followed"
					:style="{
						'background-color': highlight,
					}"
				>
					<app-jolticon class="-icon" icon="check" :style="{ color: highlightFg }" />
				</div>
			</div>
		</div>

		<div class="-name text-muted">
			{{ community.name }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../variables'

.-item
	display: inline-block

.-wrapper
	position: relative
	width: $-item-size
	height: $-item-size

.-pressy
	display: inline-block

	&:hover
		transform: scale(1.05)

	pressy()

.-img
	img-circle()
	width: 100%
	height: 100%
	border: 3px solid
	cursor: pointer
	theme-prop('border-color', 'gray')

.-followed
	position: absolute
	bottom: 0
	right: 0
	width: $-bubble-size
	height: $-bubble-size
	border-radius: 50%

	.-icon
		position: absolute
		top: 2px
		left: -1px
		margin: 0
		width: 100%
		text-align: center
		font-size: 20px
		color: $white

.-name
	text-overflow()
	font-size: $font-size-small
	text-align: center
</style>
