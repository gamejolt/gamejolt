<template>
	<div class="-list" :class="{ '-inline-list': inline }">
		<div
			class="-user"
			:class="{
				'-user-sm': sm,
			}"
			v-for="user of users"
			:key="user.id"
		>
			<app-user-avatar
				class="-avatar"
				:class="{
					'-avatar-sm': sm,
				}"
				:user="user"
				v-app-tooltip="user.display_name + ' (@' + user.username + ')'"
			/>
			<app-user-verified-tick v-if="!sm" class="-tick" :user="user" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-size = 40px
$-spacing = 3px

$-size-sm = 24px

.-list
	position: relative
	flex: 1
	display: flex
	flex-wrap: wrap
	padding-top: 4px
	padding-bottom: 4px

.-inline-list
	display: inline-flex

.-user
	flex: none
	width: $-size
	height: $-size
	margin: 0 $-spacing $-spacing
	position: relative

.-user-sm
	width: $-size-sm * 0.4
	height: $-size-sm

.-avatar
	img-circle()
	change-bg('bg-subtle')
	pressy()
	flex: none
	width: $-size
	height: $-size

.-avatar-sm
	width: $-size-sm
	height: $-size-sm

.-tick
	change-bg('bg')
	border-radius: 50%
	position: absolute
	right: 0
	bottom: 0
	pointer-events: none

</style>

<script lang="ts" src="./list"></script>
