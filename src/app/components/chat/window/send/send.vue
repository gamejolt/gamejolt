<script lang="ts" src="./send"></script>

<template>
	<!-- Message Sending -->
	<div class="chat-window-send fill-backdrop">
		<div class="-container">
			<app-chat-window-send-form
				:single-line-mode="isSingleLineMode"
				:room="room"
				@submit="submit($event)"
				@cancel="onFormCancel"
				@single-line-mode-change="onSingleLineModeChanged($event)"
				@changed="onChange($event)"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../variables'

.-container
	position: relative
</style>
