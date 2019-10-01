<template>
	<div v-if="channels.length">
		<span v-for="channel of channels" :key="channel.id">
			<a
				class="badge -channel"
				:class="{ '-selected': value && value.id === channel.id }"
				@click="emitInput(channel)"
			>
				{{ channel.title }}
			</a>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-channel
	margin-right: 4px
	user-select: none

.-selected
	change-bg('bi-bg')
	theme-prop('color', 'bi-fg')

</style>

<script lang="ts" src="./select"></script>
