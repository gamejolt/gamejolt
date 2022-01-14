<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Game } from '../../../../../_common/game/game.model';
import { GameScreenshot } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfab } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameVideo } from '../../../../../_common/game/video/video.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import FormGameImage from '../../../forms/game/image/image.vue';
import FormGameSketchfab from '../../../forms/game/sketchfab/sketchfab.vue';
import FormGameVideo from '../../../forms/game/video/video.vue';

@Options({
	components: {
		AppNavTabList,
		FormGameImage,
		FormGameVideo,
		FormGameSketchfab,
	},
})
export default class AppGameMediaItemAddModal extends mixins(BaseModal) {
	@Prop(Object) game!: Game;

	tab: 'image' | 'video' | 'sketchfab' = 'image';

	onImagesAdd(_model: any, response: any) {
		this.modal.resolve(GameScreenshot.populate(response.screenshots));
	}

	onVideoAdd(video: GameVideo) {
		this.modal.resolve([video]);
	}

	onSketchfabAdd(sketchfab: GameSketchfab) {
		this.modal.resolve([sketchfab]);
	}
}
</script>

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
						<app-link-help page="dev-media-images" class="link-help">
							<translate>dash.games.media.add.image.page_help_link</translate>
						</app-link-help>
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
						<app-link-help page="dev-media-videos" class="link-help">
							<translate>dash.games.media.add.video.page_help_link</translate>
						</app-link-help>
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
						<app-link-external class="link-help" href="https://sketchfab.com/">
							<translate>Learn more about Sketchfab...</translate>
						</app-link-external>
					</p>
				</div>

				<form-game-sketchfab :game="game" @submit="onSketchfabAdd" />
			</template>
		</div>
	</app-modal>
</template>
