<script lang="ts" src="./sidebar"></script>

<template>
	<div>
		<app-community-competition-countdown
			class="-countdown"
			:competition="channel.competition"
		/>
		<div v-if="channel.description_content">
			<app-community-channel-description :channel="channel" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-countdown
	margin-bottom: 32px
</style>
