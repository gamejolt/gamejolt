<template>
	<transition name="fade">
		<app-jolticon
			v-if="visible"
			class="emoji-button inset-container-controls"
			icon="gif"
			@click.native.prevent="openGifModal"
		/>
	</transition>
</template>

<style lang="stylus" scoped>
.emoji-button
	font-size: 20px
	transition: filter 0.15s, transform 0.2s ease
	cursor: pointer

	&:not(:hover)
		filter: grayscale(1) opacity(75%)

	&:hover
		transform: scale(1.2)

	&:focus
		outline: none
</style>

<script lang="ts" src="./controls"></script>
