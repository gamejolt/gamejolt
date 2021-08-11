<script lang="ts" src="./suggestion"></script>

<template>
	<div v-if="shouldShow">
		<slot />

		<div v-if="recommendedTags.length">
			<a v-for="tag of recommendedTags" :key="tag" class="badge -tag" @click="emitTag(tag)">
				#{{ tag }}
			</a>
		</div>

		<hr v-if="recommendedTags.length && otherTags.length" />

		<div v-if="otherTags.length">
			<a v-for="tag of otherTags" :key="tag" class="badge -tag" @click="emitTag(tag)">
				#{{ tag }}
			</a>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-tag
	margin-right: 4px
</style>
