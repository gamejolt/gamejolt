<template>
	<div class="-list">
		<div class="-user" v-for="user of users" :key="user.id">
			<app-user-avatar
				class="-avatar"
				:user="user"
				v-app-tooltip="user.display_name + ' (@' + user.username + ')'"
			/>
			<app-user-verified-tick class="-tick" :user="user" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-list
	padding-top: 4px
	padding-bottom: 4px
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(40px, 1fr))
	grid-gap: 8px

.-user
	position: relative

.-avatar
	img-circle()
	change-bg('bg-subtle')
	pressy()

.-tick
	change-bg('bg')
	border-radius: 50%
	position: absolute
	right: 0
	bottom: 0
	pointer-events: none

</style>

<script lang="ts" src="./list"></script>
