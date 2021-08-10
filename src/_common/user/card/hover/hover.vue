<script lang="ts" src="./hover"></script>

<template>
	<component :is="component" v-bind="componentProps" v-on="componentOn">
		<slot />

		<template v-if="shouldShow" #popover>
			<app-user-card class="-card" :user="user" :is-loading="!isLoaded" />
		</template>
	</component>
</template>

<style lang="stylus" scoped>
.-card
	border-radius: 0
	margin: 0 !important
</style>
