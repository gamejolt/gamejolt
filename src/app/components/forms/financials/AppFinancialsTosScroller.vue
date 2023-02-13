<script lang="ts" setup>
import { kThemeBgOffset } from '../../../../_common/theme/variables';
import { styleScrollable } from '../../../../_styles/mixins';
import { kBorderWidthBase, kFontSizeSmall } from '../../../../_styles/variables';
</script>

<template>
	<div class="_tos-container">
		<div
			class="_tos-scroller-inner"
			:style="{
				...styleScrollable,
				borderColor: kThemeBgOffset,
				padding: `10px`,
				maxHeight: `500px`,
				fontSize: kFontSizeSmall.px,
				borderWidth: kBorderWidthBase.px,
				borderStyle: `solid`,
			}"
		>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
._tos-container ::v-deep(._tos-scroller-inner)
	h1
	h2
	h3
	h4
	h5
	h6
	p
		&:first-child
			margin-top: 0
</style>
