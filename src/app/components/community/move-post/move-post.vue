<template>
	<div>
		<app-community-channel-select
			class="-channel-select"
			v-model="selectedChannel"
			:channels="selectableChannels"
		/>

		<app-button primary :disabled="!hasSelectedChannel" @click="onSelect" icon="arrow-forward">
			<translate>Move</translate>
		</app-button>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-channel-select
	margin-bottom: $line-height-computed
</style>

<script lang="ts" src="./move-post"></script>
