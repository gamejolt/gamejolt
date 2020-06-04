<template>
	<app-pill-bi no-hover>
		<app-community-thumbnail-img slot="img" :community="community" />

		<template slot="left">
			{{ community.name }}
			<app-community-verified-tick class="-tick" :community="community" small />
		</template>

		<span class="-channel" slot="right">
			{{ channel ? channel.title : '???' }}

			<a v-if="removable" class="-remove text-muted" @click="emitRemove">
				<app-jolticon icon="remove" />
			</a>
		</span>
	</app-pill-bi>
</template>

<style lang="stylus" scoped>
.-remove
	position: relative
	left: 3px

	&:hover
		color: var(--theme-highlight)

	> .jolticon
		vertical-align: middle

.-tick
	margin-left: 5px

</style>

<script lang="ts" src="./community-pill"></script>
