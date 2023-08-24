<script lang="ts">
import { toRaw } from 'vue';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { Environment } from '../../environment/environment.service';
import AppLoading from '../../loading/AppLoading.vue';
import { SiteContentBlockModel } from '../../site/content-block/content-block-model';
import { SiteModel } from '../../site/site-model';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import FormContentBlockEditor from './editor-form.vue';

const PreviewDebounce = 3000;

@Options({
	components: {
		AppLoading,
		FormContentBlockEditor,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppContentBlockEditor extends Vue {
	@Prop(Object) site!: SiteModel;
	@Prop(String) windowId!: string;
	@Prop(Object) contentBlock!: SiteContentBlockModel;

	isPreviewLoading = false;
	private previewIndex = 0;
	private previewTimeout: NodeJS.Timer | null = null;

	readonly Environment = Environment;

	@Emit('change')
	emitChange(_content: string) {}

	@Watch('contentBlock.content_markdown')
	onContentChanged(content: string, oldContent: string) {
		if (content !== oldContent) {
			this.emitChange(content);
		}

		if (content) {
			this.isPreviewLoading = true;
			this._fetchPreview();
		} else {
			this.isPreviewLoading = false;
			this.compiled('');
		}
	}

	async _fetchPreview() {
		if (this.previewTimeout) {
			clearTimeout(this.previewTimeout);
		}

		this.previewTimeout = setTimeout(async () => {
			const previewIndex = ++this.previewIndex;
			const response = await Api.sendRequest(
				'/web/dash/sites/content-preview',
				{ content: this.contentBlock.content_markdown },
				{ ignorePayloadUser: true }
			);

			if (previewIndex === this.previewIndex) {
				this.isPreviewLoading = false;
				if (response && response.success !== false && response.compiled) {
					this.compiled(response.compiled);
				}
			}

			this.previewTimeout = null;
		}, PreviewDebounce);
	}

	compiled(compiledContent: string) {
		this.contentBlock.content_compiled = compiledContent;
		this.refresh();
	}

	refresh() {
		const iframe = document.getElementById(this.windowId) as HTMLIFrameElement | undefined;
		if (iframe && iframe.contentWindow) {
			const msg = {
				type: 'content-update',
				block: toRaw(this.contentBlock),
			};
			iframe.contentWindow.postMessage(msg, '*');
		}
	}

	// Pulled from: http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
	insertAtCaret(text: string) {
		const txtarea = this.$el.getElementsByTagName('textarea')[0];
		if (!txtarea) {
			return;
		}

		const scrollPos = txtarea.scrollTop;
		let strPos = 0;
		const br =
			txtarea.selectionStart || txtarea.selectionStart === 0
				? 'ff'
				: (document as any).selection
				? 'ie'
				: false;

		if (br === 'ie') {
			txtarea.focus();
			const range = (document as any).selection.createRange();
			range.moveStart('character', -txtarea.value.length);
			strPos = range.text.length;
		} else if (br === 'ff') {
			strPos = txtarea.selectionStart;
		}

		const front = txtarea.value.substring(0, strPos);
		const back = txtarea.value.substring(strPos, txtarea.value.length);
		txtarea.value = front + text + back;
		strPos = strPos + text.length;
		if (br === 'ie') {
			txtarea.focus();
			const ieRange = (document as any).selection.createRange();
			ieRange.moveStart('character', -txtarea.value.length);
			ieRange.moveStart('character', strPos);
			ieRange.moveEnd('character', 0);
			ieRange.select();
		} else if (br === 'ff') {
			txtarea.selectionStart = strPos;
			txtarea.selectionEnd = strPos;
			txtarea.focus();
		}

		txtarea.scrollTop = scrollPos;

		this.contentBlock.content_markdown = txtarea.value;
	}
}
</script>

<template>
	<div class="content-block-editor">
		<div class="container">
			<div class="row">
				<div class="col-xs-9">
					<p>
						<strong>
							<AppTranslate>Insert Widgets</AppTranslate>
						</strong>
						{{ ' ' }}
						<span class="text-muted small">
							<AppTranslate>embed dynamic content</AppTranslate>
						</span>
					</p>

					<template v-if="!site.game_id">
						<AppButton
							v-app-tooltip="$gettext('Will show your profile bio.')"
							@click="insertAtCaret('{% user-bio %}')"
						>
							<AppTranslate>User Bio</AppTranslate>
						</AppButton>
						<AppButton
							v-app-tooltip="$gettext('Will show a grid of all your games.')"
							@click="insertAtCaret('{% game-list %}')"
						>
							<AppTranslate>Game List</AppTranslate>
						</AppButton>
						<AppButton
							trans
							:href="Environment.helpBaseUrl + '/widgets-user-site'"
							target="_blank"
						>
							<AppTranslate>View all</AppTranslate>
						</AppButton>
					</template>
					<template v-else>
						<AppButton
							v-app-tooltip="
								$gettext(`Will show your game's media (screenshots, videos, etc).`)
							"
							@click="insertAtCaret('{% game-media num=6 %}')"
						>
							<AppTranslate>Game Media</AppTranslate>
						</AppButton>
						<AppButton
							v-app-tooltip="$gettext('Will show your game\'s description.')"
							@click="insertAtCaret('{% game-description %}')"
						>
							<AppTranslate>Game Description</AppTranslate>
						</AppButton>
						<AppButton
							v-app-tooltip="$gettext('Will show your game\'s packages.')"
							@click="insertAtCaret('{% game-packages %}')"
						>
							<AppTranslate>Game Packages</AppTranslate>
						</AppButton>
						<AppButton
							trans
							:href="Environment.helpBaseUrl + '/widgets-game-site'"
							target="_blank"
						>
							<AppTranslate>View all</AppTranslate>
						</AppButton>
					</template>
				</div>
				<div class="col-xs-3">
					<AppLoading
						v-if="isPreviewLoading"
						class="pull-right"
						:hide-label="true"
						:stationary="true"
					/>
				</div>
			</div>

			<!--
			The ng-repeat will refresh the DOM any time the current block changes.
			This will create a new editor instance and refresh the block content.
		-->
			<FormContentBlockEditor :mode="site.game_id ? 'game' : 'user'" :model="contentBlock" />
		</div>
	</div>
</template>
