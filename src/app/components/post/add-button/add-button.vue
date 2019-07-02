<template>
	<div class="post-add-button well fill-offset full-bleed-xs">
		<span class="-avatar">
			<app-user-avatar-img :user="user" />
		</span>
		<div v-if="opened" class="-form-inline">
			<form-post
				form-post
				:model="localPost"
				@submit="onSubmitted"
				:lead-placeholder="placeholderMessage"
			/>
		</div>
		<div v-else class="-input" @click="open()">
			{{ placeholderMessage }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-height = 40px

.post-add-button
	display: flex

.-avatar
	theme-prop('background-color', 'bg-subtle')
	img-circle()
	flex: none
	width: $-height
	height: $-height
	margin-right: $grid-gutter-width-xs * 0.5

	@media $media-sm-up
		margin-right: $grid-gutter-width * 0.5

.-form-inline
	width: 100%

.-input
	input-placeholder-button()
	flex: auto
	position: relative
	height: $-height
	line-height: $-height
	user-select: none
	-moz-user-select: none

	&::before
		caret(var(--theme-bg-subtle), size: 9px)
		content: ''

	&:hover
		theme-prop('border-color', 'link')

		&::before
			caret(var(--theme-link), size: 9px)
</style>

<script lang="ts" src="./add-button"></script>
