<script lang="ts" src="./tile"></script>

<template>
	<a class="-tile" :class="{ '-dense': dense }" @click="shareProviderLink()">
		<div class="-icon">
			<app-jolticon class="-icon-primary" :icon="icon" />
			<app-jolticon class="-icon-secondary" icon="share-airplane" />
		</div>

		<span>{{ text }}</span>
	</a>
</template>

<style lang="stylus" scoped src="../common"></style>
