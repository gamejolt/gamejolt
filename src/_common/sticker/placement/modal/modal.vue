<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Place Sticker</translate>
			</h2>
		</div>
		<div class="modal-body">
			<div class="help-block">
				<translate
					>Position the sticker in the outlined target area below, then press
					"Place".</translate
				>
			</div>

			<div class="-mount">
				<div class="-mount-inner" ref="mount"></div>
				<v-touch @panstart="panStart" @panmove="pan" @panend="panEnd">
					<app-sticker
						ref="sticker"
						:sticker="placement"
						class="-sticker"
						:can-remove="false"
						:class="{
							'-sticker-dragging': isDragging,
						}"
					/>
				</v-touch>
			</div>
		</div>
		<div class="modal-footer">
			<app-button primary @click="onClickPlace">
				<translate>Place</translate>
			</app-button>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-mount
	margin: 10px
	border-width: 4px
	border-style: dashed
	rounded-corners-lg()
	position: relative

	animation-name: border-color-animate
	animation-duration: 1s
	animation-iteration-count: infinite

.-mount-inner
	overflow: hidden

	& >>>
		// Make it obvious which one is the new sticker
		.-sticker
			opacity: 0.75

@keyframes border-color-animate
	0%
		border-color: #26ddb4
	50%
		border-color: #9e9efd
	100%
		border-color: #26ddb4

.-sticker
	cursor: pointer

.-sticker-dragging
	filter: drop-shadow(4px 4px 5px black)
	cursor: move

	animation-name: sticker-dragging-rotate
	animation-duration: 2s
	animation-iteration-count: infinite


@keyframes sticker-dragging-rotate
	0%
		transform: none
	33%
		transform: rotateZ(25deg)
	66%
		transform: rotateZ(-25deg)
	100%
		transform: none
</style>

<script lang="ts" src="./modal"></script>
