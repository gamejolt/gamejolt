<template>
	<a v-if="user" class="user-avatar" :href="href">
		<app-user-avatar-img :user="user" />
	</a>
	<app-user-avatar-img v-else />
</template>

<style lang="stylus" scoped>
.user-avatar
	display: block
	position: relative
</style>

<script lang="ts" src="./user-avatar"></script>
