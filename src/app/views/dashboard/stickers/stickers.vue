<template>
	<div>
		<app-page-header :cover-media-item="coverMediaItem" cover-max-height="250">
			<h1 class="section-header sans-margin-bottom">
				<translate>Your Stickers</translate>
			</h1>
			<div class="text-muted small">
				<p>
					<translate>
						Your place to marvel at your sticker collection and get even more stickers.
					</translate>
				</p>
			</div>
		</app-page-header>

		<router-view />
	</div>
</template>

<script lang="ts" src="./stickers"></script>
