<template>
	<span v-app-auth-required>
		<app-button
			class="-like-button"
			icon="heart"
			circle
			:trans="trans"
			:overlay="overlay"
			:block="block"
			:primary="!!comment.user_vote"
			:solid="!!comment.user_vote"
			:disabled="isProcessing"
			@click="toggle"
		/>
		<a
			:class="{ 'blip-alt': blipAlt, liked: !!comment.user_vote }"
			@click="showLikers()"
			v-app-tooltip="$gettext(`View all people that liked this video`)"
		>
			<template v-if="blip && blipAlt">
				{{ blip | fuzzynumber }}
			</template>
			<span v-else-if="blip" class="blip" :class="{ filled: !!comment.user_vote }">
				<span class="blip-caret"></span>
				<span class="blip-count">{{ blip }}</span>
			</span>
		</a>
	</span>
</template>

<script lang="ts" src="./like-widget"></script>

<style lang="stylus" scoped>
.-like-button
	width: 36px
	height: 36px
</style>
