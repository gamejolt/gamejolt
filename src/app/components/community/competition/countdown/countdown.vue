<script lang="ts" src="./countdown"></script>

<template>
	<div>
		<h2 class="-title">{{ titleText }}</h2>

		<div v-if="blocksData.length" class="-blocks">
			<div v-for="blockData of blocksData" :key="blockData.text" class="-block-container">
				<div class="-block">
					<div class="-block-digits">
						<div class="-block-digit">{{ blockData.digit1 }}</div>
						<div class="-block-digit">{{ blockData.digit2 }}</div>
					</div>
					<div class="-block-text">
						<span class="text-muted">{{ blockData.text }}</span>
					</div>
				</div>
				<div v-if="blockData.hasSeparator" class="-block-separator">:</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-title
	text-align: center
	margin-top: 0
	margin-bottom: 12px

.-block-container
	display: inline-flex
	align-items: center

.-block
	display: inline-flex
	flex-direction: column
	align-items: center

.-block-digit
	display: inline-block
	font-size: $font-size-large
	font-weight: bold
	background-color: var(--theme-bg)
	padding-left: 8px
	padding-right: 8px
	padding-top: 4px
	padding-bottom: 4px
	rounded-corners()
	elevate-1()

.-block-text
	margin-top: 4px
	font-size: $font-size-tiny

.-block-separator
	display: inline-block
	margin-left: 16px
	margin-right: 16px
	margin-bottom: 20px
	font-size: $font-size-large
	font-weight: bold
</style>
