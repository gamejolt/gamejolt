<template>
	<div v-app-auth-required>
		<div class="comment-add-button" @click="open()">
			{{ placeholderText }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.comment-add-button
	input-placeholder-button()
	change-bg('bg')
	margin-bottom: $line-height-computed
</style>

<script lang="ts" src="./add-button"></script>
