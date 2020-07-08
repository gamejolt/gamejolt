<template>
	<app-card-list-item :id="elementId" :item="presetType">
		<div class="-row">
			<div>
				<div class="-channel-img-preview">
					<img
						v-if="background"
						:src="background.mediaserver_url"
						:alt="background.mediaserver_url"
					/>
				</div>
			</div>

			<div class="card-title">
				<h5>
					{{ label }}
				</h5>
			</div>
		</div>
		<template slot="body">
			<form-community-channel-edit-preset
				:model="community"
				:preset-type="presetType"
				@save="emitEdit"
				@clear="emitEdit"
			/>
		</template>
	</app-card-list-item>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-row
	display: flex
	align-items: center

.-channel-img-preview
	rounded-corners()
	display: flex
	align-items: center
	width: 96px
	height: 25px
	overflow: hidden

	> img
		width: 100%

.card-title
	margin-left: 16px
	margin-bottom: 0
</style>

<script lang="ts" src="./preset-list-item"></script>
