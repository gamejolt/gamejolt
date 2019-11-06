<template>
	<div v-app-auth-required class="post-add-button sheet sheet-elevate">
		<span class="-avatar">
			<app-user-avatar-img :user="user" />
		</span>
		<div class="-input" @click="open()">
			{{ placeholderMessage }}
		</div>
	</div>
</template>

<style lang="stylus" src="./add-button.styl" scoped></style>

<script lang="ts" src="./add-button"></script>
