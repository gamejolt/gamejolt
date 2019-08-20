<template>
	<app-button
		v-if="shouldShow"
		class="user-follow-widget"
		primary
		:icon="icon"
		:circle="circle"
		:overlay="overlay"
		:block="block"
		:sm="sm"
		:solid="user.is_following"
		:badge="badge"
		v-app-auth-required
		v-app-tooltip.bottom="{
			content: tooltip,
			container: tooltipContainer,
		}"
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

<script lang="ts" src="./widget"></script>
