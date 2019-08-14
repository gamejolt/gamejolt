<template>
	<div
		class="loading"
		:class="{
			'loading-big': big,
			'loading-stationary': stationary,
			'loading-bw': noColor,
			'loading-centered': centered,
		}"
	>
		<img :src="img" alt="Loading" title="Loading..." />
		<span class="loading-label" :class="{ 'sr-only': hideLabel }">
			{{ label }}
		</span>
	</div>
</template>

<style lang="stylus" src="./loading.styl" scoped></style>

<script lang="ts" src="./loading"></script>
