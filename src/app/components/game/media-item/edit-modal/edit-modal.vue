<template>
	<app-modal>
		<div class="modal-controls">
			<app-button trans @click="remove()">
				{{ removeText }}
			</app-button>

			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<!-- <div class="row"> -->
			<!-- <div class="col-sm-4">
				<br>

				<app-button
					block
					trans
					@click.stop="Clipboard.copy( Environment.baseUrl + item.getUrl( game ) )"
					v-app-tooltip="copyLinkTooltip"
					>
					<translate>Copy Link</translate>
				</app-button>

				<app-button
					block
					trans
					@click="remove()"
					>
					{{ removeText }}
				</app-button>
			</div> -->
			<!-- <div class="col-sm-8"> -->
			<form-game-image
				v-if="item.media_type === 'image'"
				:game="game"
				:model="item"
				@submit="onMediaEdited"
			/>

			<form-game-video
				v-else-if="item.media_type === 'video'"
				:game="game"
				:model="item"
				@submit="onMediaEdited"
			/>

			<form-game-sketchfab
				v-else-if="item.media_type === 'sketchfab'"
				:game="game"
				:model="item"
				@submit="onMediaEdited"
			/>

			<hr />

			<p class="text-right">
				<app-button trans @click.stop="copyLink()" v-app-tooltip="copyLinkTooltip">
					<translate>Copy Link</translate>
				</app-button>
			</p>

			<template v-if="item.media_type === 'image'">
				<div class="text-center">
					<img
						class="img-responsive img-rounded"
						:src="item.media_item.img_url"
						:alt="item.caption"
					/>
				</div>
			</template>
			<!-- </div> -->
			<!-- </div> -->
		</div>
	</app-modal>
</template>

<script lang="ts" src="./edit-modal"></script>
