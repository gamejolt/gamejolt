<script lang="ts">
import { mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { GameModel } from '../../../../../_common/game/game.model';
import { $saveGameVideo, GameVideoModel } from '../../../../../_common/game/video/video.model';
import AppVideoEmbed from '../../../../../_common/video/embed/AppVideoEmbed.vue';
import { REGEX_VIDEO, REGEX_VIMEO, REGEX_YOUTUBE } from '../../../../../utils/regex';

type FormModel = GameVideoModel & {
	_url?: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppVideoEmbed,
	},
})
export default class FormGameVideo extends mixins(Wrapper) {
	@Prop(Object) game!: GameModel;

	modelClass = GameVideoModel;
	modelSaveHandler = $saveGameVideo;

	readonly REGEX_VIDEO = REGEX_VIDEO;

	get hasValidVideoUrl() {
		return !!this.videoData;
	}

	get videoData() {
		const url = this.formModel._url;
		if (!url) {
			return null;
		}

		const youtubeMatch = url.match(REGEX_YOUTUBE);
		if (youtubeMatch) {
			return { id: youtubeMatch[youtubeMatch.length - 1], type: GameVideoModel.TYPE_YOUTUBE };
		}

		const vimeoMatch = url.match(REGEX_VIMEO);
		if (vimeoMatch) {
			return { id: vimeoMatch[vimeoMatch.length - 1], type: GameVideoModel.TYPE_VIMEO };
		}
	}

	created() {
		this.form.warnOnDiscard = false;
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('game_id', this.game.id);

		// We use _url as the form model's URL and copy back and forth.
		if (this.formModel.url) {
			if (this.formModel.type === GameVideoModel.TYPE_VIMEO) {
				this.setField('_url', 'https://www.vimeo.com/' + this.formModel.url);
			} else if (this.formModel.type === GameVideoModel.TYPE_YOUTUBE) {
				this.setField('_url', 'https://www.youtube.com/watch?v=' + this.formModel.url);
			}
		}
	}

	@Watch('formModel._url')
	onUrlChange(url: string) {
		// Check if we need to scrub out anything from the URL.
		// Will be the case if they entered in a full URL such as http://www.youtube.com/watch?v=something, etc.
		if (url) {
			const videoData = this.videoData;
			if (videoData) {
				this.setField('type', videoData!.type);
				this.setField('url', videoData!.id);
			}
		}
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="_url" :label="$gettext(`Video URL`)">
			<AppFormControl type="text" :validators="[validatePattern(REGEX_VIDEO)]" />

			<AppFormControlErrors :label="$gettext(`video URL`)" />

			<p v-translate class="help-block">
				We currently only support videos from Vimeo or YouTube.
				<br />
				The URL should look something like:
				<br />
				<strong>YouTube:</strong>
				<code>https://youtube.com/watch?v=oHg5SJYRHA0</code>
				<br />
				<strong>Vimeo:</strong>
				<code>https://vimeo.com/243244233</code>
			</p>
			<template v-if="hasValidVideoUrl && videoData">
				<br />
				<AppVideoEmbed :video-provider="videoData.type" :video-id="videoData.id" />
			</template>
		</AppFormGroup>

		<AppFormGroup name="title" :label="$gettext(`Title`)">
			<AppFormControl type="text" :validators="[validateMaxLength(150)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="description" :label="$gettext(`Description`)" :optional="true">
			<AppFormControlTextarea rows="5" :validators="[validateMaxLength(2500)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton show-when-valid>
			<AppTranslate v-if="method === 'add'">Add</AppTranslate>
			<AppTranslate v-else-if="method === 'edit'">Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
