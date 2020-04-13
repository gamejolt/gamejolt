<template>
	<app-card-list-item :id="elementId" :item="presetType">
		<div class="row">
			<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
				<img
					v-if="background"
					class="-channel-img-preview"
					:src="background.mediaserver_url"
				/>

				<br class="visible-xs" />
			</div>
			<div class="col-xs-12 col-sm-10">
				<div class="card-title">
					<h5>
						{{ label }}
					</h5>
				</div>
			</div>
		</div>
		<template slot="body">
			<form-community-channel-edit-preset
				:model="community"
				:preset-type="presetType"
				@save="emitEdited"
				@clear="emitEdited"
			/>
		</template>
	</app-card-list-item>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-channel-img-preview
	width: 68px
	height: 25px
	rounded-corners()
</style>

<script lang="ts" src="./preset-list-item"></script>
