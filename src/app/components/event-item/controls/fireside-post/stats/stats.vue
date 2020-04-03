<template>
	<div v-if="shouldShowStats">
		<span class="dot-separator" />

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

		<span
			class="hidden-xs"
			v-app-tooltip="
				$gettext(
					'An expand is some sort of interaction with your post. For example, playing a video post, or clicking into your post.'
				)
			"
		>
			<app-jolticon icon="help-circle" />
		</span>
	</div>
</template>

<script lang="ts" src="./stats"></script>
