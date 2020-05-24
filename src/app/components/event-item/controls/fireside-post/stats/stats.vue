<template>
	<div v-if="shouldShowStats">
		<translate
			:translate-n="post.view_count || 0"
			:translate-params="{ count: number(post.view_count || 0) }"
			translate-plural="%{ count } views"
		>
			%{ count } view
		</translate>

		<span class="dot-separator" />

		<translate
			:translate-n="post.expand_count || 0"
			:translate-params="{ count: number(post.expand_count || 0) }"
			translate-plural="%{ count } expands"
		>
			%{ count } expand
		</translate>

		<app-jolticon
			class="hidden-xs"
			icon="help-circle"
			@touchend.native.prevent
			v-app-tooltip.touchable="
				$gettext(
					'An expand is some sort of interaction with your post. For example, playing a video post, or clicking into your post.'
				)
			"
		/>
	</div>
</template>

<script lang="ts" src="./stats"></script>
