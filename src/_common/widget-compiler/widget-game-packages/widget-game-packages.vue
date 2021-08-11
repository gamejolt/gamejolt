<script lang="ts" src="./widget-game-packages"></script>

<template>
	<div class="widget-compiler-widget-game-packages">
		<div v-for="sellable of sellables" :key="sellable.id">
			<iframe
				nwdisable
				nwfaketop
				:src="`${widgetHost}/sale/v1?key=${sellable.key}&theme=${theme}`"
				frameborder="0"
				width="100%"
				height="245"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.widget-compiler-widget-game-packages
	max-width: 500px
	margin: 0 auto

	iframe
		margin-bottom: $line-height-computed
</style>
