<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-nav-tab-list>
				<ul>
					<li>
						<a @click="tab = 'image'" :class="{ active: tab === 'image' }">
							<translate>Images</translate>
						</a>
					</li>
					<li>
						<a @click="tab = 'video'" :class="{ active: tab === 'video' }">
							<translate>Videos</translate>
						</a>
					</li>
					<li>
						<a @click="tab = 'sketchfab'" :class="{ active: tab === 'sketchfab' }">
							Sketchfab
						</a>
					</li>
				</ul>
			</app-nav-tab-list>

			<br />

			<template v-if="tab === 'image'">
				<div class="alert full-bleed-xs">
					<p>
						<translate>
							Add screenshots, concept drawings, photos of little clay models, fake box covers, or
							any other original art created for the game. Yes, even if it's a text-based game!
						</translate>
					</p>
					<br />
					<div>
						<a class="link-help" href="https://help.gamejolt.com/dev-media-images" target="_blank">
							<translate>dash.games.media.add.image.page_help_link</translate>
						</a>
					</div>
				</div>

				<form-game-image :game="game" @submit="onImagesAdd" />
			</template>
			<template v-else-if="tab === 'video'">
				<div class="alert full-bleed-xs">
					<p>
						<translate>
							Add videos you've created, such as trailers, gameplay footage, walkthroughs, etc.
						</translate>
					</p>
					<p>
						<translate>
							Please don't add Let's Plays or reviews. Let the content owners do that themselves in
							the comments.
						</translate>
					</p>
					<br />
					<div>
						<a class="link-help" href="https://help.gamejolt.com/dev-media-videos" target="_blank">
							<translate>dash.games.media.add.video.page_help_link</translate>
						</a>
					</div>
				</div>

				<form-game-video :game="game" @submit="onVideoAdd" />
			</template>
			<template v-else-if="tab === 'sketchfab'">
				<div class="alert full-bleed-xs">
					<p>
						<translate>
							With Sketchfab you can embed 3D content from your game in the browser. You can also
							view that content from any Virtual Reality headset. AMAZING!
						</translate>
					</p>
					<p>
						<a
							class="link-help"
							href="https://sketchfab.com/"
							target="_blank"
							rel="nofollow noopener"
						>
							<translate>Learn more about Sketchfab...</translate>
						</a>
					</p>
				</div>

				<form-game-sketchfab :game="game" @submit="onSketchfabAdd" />
			</template>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./add-modal"></script>
