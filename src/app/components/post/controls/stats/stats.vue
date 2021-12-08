<script lang="ts" src="./stats"></script>

<template>
	<div v-if="shouldShowStats">
		<translate
			:translate-n="post.view_count || 0"
			:translate-params="{ count: formatNumber(post.view_count || 0) }"
			translate-plural="%{ count } views"
		>
			%{ count } view
		</translate>
	</div>
</template>
