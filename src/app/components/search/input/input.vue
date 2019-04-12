<template>
	<input
		type="search"
		class="search-input form-control"
		name="q"
		:placeholder="$gettext('search.input.placeholder')"
		autocomplete="off"
		@focus="$emit('focus', $event)"
		@blur="$emit('blur', $event)"
		@keydown="$emit('keydown', $event)"
		:value="value"
		@input="onChange($event.target.value)"
	/>
</template>

<style lang="stylus" scoped>
// Gotta make room for the search history icon
.search-input
	padding-left: 40px
</style>

<script lang="ts" src="./input"></script>
