<script lang="ts" src="./lang-selector"></script>

<template>
	<select v-model="lang" class="translate-lang-selector form-control" @change="onChange">
		<option v-for="langData of langs" :key="langData.code" :value="langData.code">
			{{ langData.label }}
		</option>
	</select>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.translate-lang-selector
	theme-prop('color', 'light')
	theme-prop('border-color', 'light')
	margin: $line-height-computed auto
	width: auto
	background-color: transparent

	&:focus
	&:active
		border-color: $white

	@media $media-sm-up
		display: inline-block
		margin: 0
</style>
