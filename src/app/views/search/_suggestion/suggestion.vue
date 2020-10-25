<script lang="ts" src="./suggestion"></script>

<template>
	<section class="section">
		<div class="container fill-offset -suggested-container">
			<p class="help-block -suggested">
				<translate>Suggested</translate>
				<app-jolticon
					v-app-tooltip="this.$gettext('Only you can see suggested results.')"
					icon="help-circle"
				/>
			</p>

			<app-search-suggestion-item v-for="item of data" :key="item.type" :data="item" />
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-suggested-container
	padding-top: 12px
	padding-bottom: 12px
	rounded-corners-lg()

.-suggested
	margin-top: 0

.-game-tag
	width: 100px
	margin: 0
</style>
