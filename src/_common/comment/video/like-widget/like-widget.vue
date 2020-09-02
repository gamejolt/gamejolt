<template>
	<span v-app-auth-required>
		<app-button
			class="-like-button"
			:icon="!voted ? 'heart' : 'heart-filled'"
			circle
			:trans="trans"
			:overlay="overlay"
			:block="block"
			:primary="voted"
			:solid="voted"
			:disabled="isProcessing"
			@click="toggle"
			v-app-track-event="`video-like-widget:click`"
		/>
		<a
			v-if="blip"
			class="blip"
			:class="{ 'blip-active': voted }"
			@click="showLikers()"
			v-app-tooltip="$gettext(`View all people that liked this video`)"
		>
			{{ blip | fuzzynumber }}
		</a>
		<span v-else class="blip-missing" />
	</span>
</template>

<script lang="ts" src="./like-widget"></script>

<style lang="stylus" scoped>
.-like-button
	width: 36px
	height: 36px
</style>
