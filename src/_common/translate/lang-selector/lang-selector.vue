<template>
	<select class="translate-lang-selector form-control" v-model="lang" @change="onChange">
		<option v-for="lang of langs" :key="lang.code" :value="lang.code">
			{{ lang.label }}
		</option>
	</select>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.translate-lang-selector
	theme-prop('color', 'light')
	theme-prop('border-color', 'light')
	margin: $line-height-computed auto
	width: auto
	background-color: transparent

	&:focus, &:active
		border-color: $white

	@media $media-sm-up
		display: inline-block
		margin: 0
</style>

<script lang="ts" src="./lang-selector"></script>
