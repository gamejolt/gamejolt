<script lang="ts" src="./incomplete"></script>

<template>
	<app-form-post-community-pill-selector
		:communities="communities"
		:initial-community="community"
		@select="emitAdd"
	>
		<app-pill-bi class="-pill" no-hover>
			<template #img>
				<app-community-thumbnail-img :community="community" />
			</template>

			<template #left>
				{{ community.name }}
				<app-community-verified-tick class="-tick" :community="community" small />
			</template>

			<template #right>
				<span class="-channel">
					<translate>Select Channel</translate>
				</span>
			</template>
		</app-pill-bi>
	</app-form-post-community-pill-selector>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-pill
	height: $pill-height
	border-color: var(--theme-notice)
	cursor: pointer
	transition: border-color 300ms $strong-ease-out

	.-channel
		color: var(--theme-notice)
		transition: color 300ms $strong-ease-out
		font-weight: bold

	&:hover
		border-color: var(--theme-link-hover)

		.-channel
			color: var(--theme-link-hover)

.-tick
	margin-left: 5px
</style>
