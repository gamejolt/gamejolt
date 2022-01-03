<script lang="ts" src="./countdown"></script>

<template>
	<div class="-countdown">
		<div class="-title">
			<strong>{{ titleText }}</strong>
		</div>
		<div v-if="blocksData.length" class="-blocks">
			<div v-for="blockData of blocksData" :key="blockData.text" class="-block-container">
				<div class="-block">
					<div class="-block-digits">
						<div class="-block-digit">
							<template v-for="digit in blockData.digits">
								{{ digit }}
							</template>
						</div>
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
.-countdown
	display: flex
	flex-direction: column
	justify-content: center
	margin-bottom: $line-height-computed

	@media $media-sm-up
		flex-direction: row

.-title
	flex: none
	padding-top: 4px

	@media $media-sm-up
		margin-right: ($grid-gutter-width / 2)

.-blocks
	flex: none

.-block-container
	display: inline-flex
	align-items: center

.-block
	display: inline-flex
	flex-direction: column
	align-items: center

.-block-digit
	rounded-corners()
	elevate-1()
	display: inline-block
	font-weight: bold
	background-color: var(--theme-bg)
	padding: 4px 6px

.-block-text
	margin-top: 4px
	font-size: $font-size-tiny

.-block-separator
	display: inline-block
	margin-left: 8px
	margin-right: 8px
	margin-bottom: 20px
	font-size: $font-size-large
	font-weight: bold
</style>
