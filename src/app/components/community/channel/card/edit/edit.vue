<script lang="ts" src="./edit"></script>

<template>
	<app-editable-overlay class="-background-overlay" @click="onClickEdit">
		<template #overlay>
			<span>
				<translate>Change Background</translate>
			</span>
		</template>

		<template #default>
			<div class="-background-preview">
				<img
					v-if="background"
					:src="background.mediaserver_url"
					:alt="background.mediaserver_url"
				/>
			</div>
		</template>
	</app-editable-overlay>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../variables'

.-background-overlay
	rounded-corners-lg()
	overflow: hidden
	width: $card-width
	height: $card-height

.-background-preview
	rounded-corners-lg()
	display: flex
	align-items: center
	width: $card-width
	height: $card-height
	overflow: hidden

	img
		width: 100%
</style>
