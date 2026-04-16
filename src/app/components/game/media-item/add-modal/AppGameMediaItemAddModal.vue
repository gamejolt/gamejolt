<script lang="ts" setup>
import { ref } from 'vue';

import FormGameImage from '~app/components/forms/game/image/FormGameImage.vue';
import FormGameSketchfab from '~app/components/forms/game/sketchfab/FormGameSketchfab.vue';
import FormGameVideo from '~app/components/forms/game/video/FormGameVideo.vue';
import AppButton from '~common/button/AppButton.vue';
import { GameModel } from '~common/game/game.model';
import { GameScreenshotModel } from '~common/game/screenshot/screenshot.model';
import { GameSketchfabModel } from '~common/game/sketchfab/sketchfab.model';
import { GameVideoModel } from '~common/game/video/video.model';
import AppLinkExternal from '~common/link/AppLinkExternal.vue';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppNavTabList from '~common/nav/tab-list/AppNavTabList.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	game: GameModel;
};

const { game } = defineProps<Props>();

const modal = useModal()!;

const tab = ref<'image' | 'video' | 'sketchfab'>('image');

function onImagesAdd(_model: any, response: any) {
	modal.resolve(GameScreenshotModel.populate(response.screenshots));
}

function onVideoAdd(video: GameVideoModel) {
	modal.resolve([video]);
}

function onSketchfabAdd(sketchfab: GameSketchfabModel) {
	modal.resolve([sketchfab]);
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
						<a :class="{ active: tab === 'image' }" @click="tab = 'image'">
							<AppTranslate>Images</AppTranslate>
						</a>
					</li>
					<li>
						<a :class="{ active: tab === 'video' }" @click="tab = 'video'">
							<AppTranslate>Videos</AppTranslate>
						</a>
					</li>
					<li>
						<a :class="{ active: tab === 'sketchfab' }" @click="tab = 'sketchfab'">
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
