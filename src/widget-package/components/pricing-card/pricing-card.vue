<script lang="ts" src="./pricing-card"></script>

<template>
	<div class="-card " :class="sellable.is_owned ? 'fill-highlight' : 'fill-gray'">
		<template v-if="sellable.is_owned">
			<strong>
				OWNED
			</strong>
		</template>
		<template v-else>
			<template v-if="sellable.type === 'paid'">
				<span v-if="originalPrice" class="-discount"> -{{ discount }}% </span>
				<strong class="-amount">
					{{ currency(price) }}
				</strong>
				<span v-if="originalPrice" class="-amount -amount-old">
					{{ currency(originalPrice) }}
				</span>
				<br />
				<span class="-tag -muted">
					or more
				</span>
			</template>
			<template v-else-if="sellable.type === 'pwyw'">
				<span class="-tag">
					name your price
				</span>
			</template>
			<template v-else-if="sellable.type === 'free'">
				<strong class="-amount">
					FREE
				</strong>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-card
	rounded-corners()
	float: right
	margin-top: -($shell-padding + $pricing-card-offset)
	margin-left: 15px
	padding: 10px
	text-align: center

.-amount
	color: $white
	font-size: $font-size-large

.-amount-old
	color: $gray-lighter
	margin-left: 5px
	text-decoration: line-through
	font-size: $font-size-tiny

.-discount
	theme-prop('background-color', 'highlight')
	theme-prop('color', 'highlight-fg')
	display: block
	margin-left: -10px
	margin-right: -10px
	margin-top: -10px
	margin-bottom: 5px
	padding-top: 3px
	padding-bottom: 3px
	font-weight: bold

.-tag
	color: $white
	font-size: $font-size-tiny
	font-weight: bold
	text-transform: uppercase

	&.-muted
		color: $gray-lighter
</style>
