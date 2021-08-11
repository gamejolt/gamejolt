<script lang="ts" src="./input"></script>

<template>
	<input
		type="search"
		class="search-input form-control"
		name="q"
		:placeholder="$gettext('search.input.placeholder')"
		autocomplete="off"
		:value="modelValue"
		@focus="$emit('focus', $event)"
		@blur="$emit('blur', $event)"
		@keydown="$emit('keydown', $event)"
		@input="onChange($event.target.value)"
	/>
</template>
