<script lang="ts" src="./hover"></script>

<template>
	<component :is="component" v-bind="componentProps" v-on="componentOn">
		<slot />

		<template v-if="shouldShow" slot="popover">
			<app-user-card class="-card" :user="user" :is-loading="!isLoaded" :no-stats="noStats" />
		</template>
	</component>
</template>

<style lang="stylus" scoped>
.-card
	border-radius: 0
	margin: 0 !important
</style>
