<template>
	<app-form-post-community-pill-selector
		:communities="communities"
		:initial-community="community"
		@select="emitAdd"
	>
		<app-pill-bi class="-pill" no-hover>
			<app-community-thumbnail-img slot="img" :community="community" />

			<template slot="left">
				{{ community.name }}
				<app-community-verified-tick class="-tick" :community="community" small />
			</template>

			<span class="-channel text-muted" slot="right">
				<span class="-channel-name-placeholder"></span>
			</span>
		</app-pill-bi>
	</app-form-post-community-pill-selector>
</template>

<style lang="stylus" scoped>
.-pill
	border-color: var(--theme-notice)
	cursor: pointer

.-tick
	margin-left: 5px

.-channel-name-placeholder
	display: inline-block
	width: 40px
</style>

<script lang="ts" src="./incomplete"></script>
