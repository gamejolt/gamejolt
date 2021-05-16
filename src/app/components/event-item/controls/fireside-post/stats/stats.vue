<script lang="ts" src="./stats"></script>

<template>
	<div v-if="shouldShowStats">
		<template v-if="post.view_count && post.view_count > 0">
			<translate
				:translate-n="post.view_count || 0"
				:translate-params="{ count: number(post.view_count || 0) }"
				translate-plural="%{ count } views"
			>
				%{ count } view
			</translate>
		</template>
		<template v-else>
			<translate>Views are being collected...</translate>
		</template>
	</div>
</template>
