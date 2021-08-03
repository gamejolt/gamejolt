<script lang="ts" src="./widget"></script>

<template>
	<app-button
		v-if="shouldShow"
		v-app-auth-required
		v-app-tooltip.bottom="tooltip"
		class="user-follow-widget"
		primary
		:icon="icon"
		:circle="circle"
		:overlay="overlay"
		:block="block"
		:sm="sm"
		:solid="user.is_following"
		:badge="badge"
		@click.stop="onClick"
	>
		<template v-if="!circle">
			<template v-if="!user.is_following">
				<translate>Follow</translate>
			</template>
			<template v-else>
				<translate>Following</translate>
			</template>
		</template>
	</app-button>
</template>
