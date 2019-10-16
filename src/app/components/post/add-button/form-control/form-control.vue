<template>
	<div class="post-add-button sheet sheet-elevate">
		<span class="-avatar">
			<app-user-avatar-img :user="user" />
		</span>
		<div class="-input">
			<app-form-control type="text" :rules="rules" :placeholder="placeholder" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '../add-button'

.post-add-button
	margin-bottom: 0

.-input > input
	border: none
	padding: 0
	margin: 0
	display: inline-block
	color:  var(--theme-fg-muted)
</style>

<script lang="ts" src="./form-control"></script>
