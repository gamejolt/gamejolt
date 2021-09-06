<script lang="ts" src="./stream-setup-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<template v-if="c.canBrowserStream">
			<div class="modal-body">
				<app-stream-setup
					v-if="c.canBrowserStream"
					:fireside-host-rtc="firesideHostRtc"
					@close="onClose()"
				/>
			</div>
		</template>
		<template v-else>
			<div class="modal-header">
				<h2 class="modal-title">
					<translate>
						Your browser either cannot broadcast, or will have poor performance.
					</translate>
				</h2>
			</div>

			<div class="modal-body">
				<app-illustration src="~img/ill/no-comments-small.svg">
					<p>
						<translate>
							Please use a different browser, such as Google Chrome or Microsoft Edge,
							if you want to start a broadcast.
						</translate>
					</p>
				</app-illustration>
			</div>
		</template>
	</app-modal>
</template>
