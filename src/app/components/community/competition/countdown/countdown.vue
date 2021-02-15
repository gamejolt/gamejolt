<script lang="ts" src="./countdown"></script>

<template>
	<div>
		<h2 class="sans-margin-top">{{ titleText }}</h2>

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
@import '~styles/variables'
@import '~styles-lib/mixins'

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
