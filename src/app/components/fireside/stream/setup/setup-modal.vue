<script lang="ts" src="./setup-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<template v-if="!c.canBrowserStream.value">
			<div class="modal-body">
				<app-illustration :src="illNoCommentsSmall">
					<p>
						<translate>
							Your browser either cannot stream, or will have poor performance.
						</translate>
					</p>
					<p>
						<translate>
							Please use a different browser, such as Google Chrome or Microsoft Edge,
							if you want to start a stream.
						</translate>
					</p>
				</app-illustration>
			</div>
		</template>
		<template v-else-if="c.isStreamingElsewhere.value">
			<div class="modal-body">
				<app-illustration :src="illNoCommentsSmall">
					<p>
						<translate>
							You're currently streaming on another device. Stop that stream before
							starting a new one.
						</translate>
					</p>
				</app-illustration>
			</div>
		</template>
		<template v-else>
			<div class="modal-body">
				<app-stream-setup :c="c" @close="onClose()" />
			</div>
		</template>
	</app-modal>
</template>
