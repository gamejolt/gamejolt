<script lang="ts" src="./add"></script>

<template>
	<app-fireside-avatar-base :class="{ '-disabled': isDisabled }" border-style="dashed">
		<template #avatar>
			<app-jolticon icon="add" />
		</template>

		<template #tag>
			<translate class="-start">START</translate>
		</template>

		<template #link>
			<a
				v-app-tooltip.touchable="
					isDisabled
						? $gettext(`Only members of this community can create a fireside in it.`)
						: null
				"
				@click="onClick"
			/>
		</template>
	</app-fireside-avatar-base>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-disabled
	filter: brightness(0.4)

	&
	a
		cursor: not-allowed

.jolticon
	font-size: $jolticon-size * 2
</style>
