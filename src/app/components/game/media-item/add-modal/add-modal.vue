<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { GameModel } from '../../../../../_common/game/game.model';
import { GameScreenshotModel } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfabModel } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameVideoModel } from '../../../../../_common/game/video/video.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppNavTabList from '../../../../../_common/nav/tab-list/AppNavTabList.vue';
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
	@Prop(Object) game!: GameModel;

	tab: 'image' | 'video' | 'sketchfab' = 'image';

	onImagesAdd(_model: any, response: any) {
		this.modal.resolve(GameScreenshotModel.populate(response.screenshots));
	}

	onVideoAdd(video: GameVideoModel) {
		this.modal.resolve([video]);
	}

	onSketchfabAdd(sketchfab: GameSketchfabModel) {
		this.modal.resolve([sketchfab]);
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<AppNavTabList>
				<ul>
					<li>
						<a @click="tab = 'image'" :class="{ active: tab === 'image' }">
							<AppTranslate>Images</AppTranslate>
						</a>
					</li>
					<li>
						<a @click="tab = 'video'" :class="{ active: tab === 'video' }">
							<AppTranslate>Videos</AppTranslate>
						</a>
					</li>
					<li>
						<a @click="tab = 'sketchfab'" :class="{ active: tab === 'sketchfab' }">
							Sketchfab
						</a>
					</li>
				</ul>
			</AppNavTabList>

			<br />

			<template v-if="tab === 'image'">
				<div class="alert full-bleed-xs">
					<p>
						<AppTranslate>
							Add screenshots, concept drawings, photos of little clay models, fake
							box covers, or any other original art created for the game. Yes, even if
							it's a text-based game!
						</AppTranslate>
					</p>
					<br />
					<div>
						<AppLinkHelp page="dev-media-images" class="link-help">
							<AppTranslate>Learn more about screenshots/images...</AppTranslate>
						</AppLinkHelp>
					</div>
				</div>

				<FormGameImage :game="game" @submit="onImagesAdd" />
			</template>
			<template v-else-if="tab === 'video'">
				<div class="alert full-bleed-xs">
					<p>
						<AppTranslate>
							Add videos you've created, such as trailers, gameplay footage,
							walkthroughs, etc.
						</AppTranslate>
					</p>
					<p>
						<AppTranslate>
							Please don't add Let's Plays or reviews. Let the content owners do that
							themselves in the comments.
						</AppTranslate>
					</p>
					<br />
					<div>
						<AppLinkHelp page="dev-media-videos" class="link-help">
							<AppTranslate>Learn more about videos...</AppTranslate>
						</AppLinkHelp>
					</div>
				</div>

				<FormGameVideo :game="game" @submit="onVideoAdd" />
			</template>
			<template v-else-if="tab === 'sketchfab'">
				<div class="alert full-bleed-xs">
					<p>
						<AppTranslate>
							With Sketchfab you can embed 3D content from your game in the browser.
							You can also view that content from any Virtual Reality headset.
							AMAZING!
						</AppTranslate>
					</p>
					<p>
						<AppLinkExternal class="link-help" href="https://sketchfab.com/">
							<AppTranslate>Learn more about Sketchfab...</AppTranslate>
						</AppLinkExternal>
					</p>
				</div>

				<FormGameSketchfab :game="game" @submit="onSketchfabAdd" />
			</template>
		</div>
	</AppModal>
</template>
