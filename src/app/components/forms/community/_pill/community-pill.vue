<script lang="ts" src="./community-pill"></script>

<template>
	<app-pill v-if="!withChannel">
		<template #img>
			<app-community-thumbnail-img :community="community" />
		</template>
		<template #default>
			{{ community.name }}
			<app-community-verified-tick class="-tick" :community="community" small />

			<a v-if="removable" class="-remove text-muted" @click="emitRemove">
				<app-jolticon icon="remove" />
			</a>
		</template>
	</app-pill>
	<app-pill-bi v-else no-hover>
		<template #img>
			<app-community-thumbnail-img :community="community" />
		</template>

		<template #left>
			{{ community.name }}
			<app-community-verified-tick class="-tick" :community="community" small />
		</template>

		<template #right>
			<span class="-channel">
				{{ channel ? channel.displayTitle : '???' }}

				<a v-if="removable" class="-remove text-muted" @click="emitRemove">
					<app-jolticon icon="remove" />
				</a>
			</span>
		</template>
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
