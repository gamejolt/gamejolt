<script lang="ts" setup>
import { PropType, ref, toRaw, toRefs, watch } from 'vue';
import { Api } from '../../api/api.service';
import AppButton from '../../button/AppButton.vue';
import { Environment } from '../../environment/environment.service';
import AppLoading from '../../loading/AppLoading.vue';
import { SiteContentBlockModel } from '../../site/content-block/content-block-model';
import { SiteModel } from '../../site/site-model';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import FormContentBlockEditor from './editor-form.vue';

const PreviewDebounce = 3000;

const props = defineProps({
	site: {
		type: Object as PropType<SiteModel>,
		required: true,
	},
	windowId: {
		type: String,
		required: true,
	},
	contentBlock: {
		type: Object as PropType<SiteContentBlockModel>,
		required: true,
	},
});

const emit = defineEmits({
	change: (_content: string) => true,
});

const { site, windowId, contentBlock } = toRefs(props);

const isPreviewLoading = ref(false);
const previewIndex = ref(0);
const previewTimeout = ref<NodeJS.Timer | null>(null);
const rootElem = ref<HTMLDivElement>();

watch(
	() => contentBlock.value.content_markdown,
	(content: string, oldContent: string) => {
		if (content !== oldContent) {
			emit('change', content);
		}

		if (content) {
			isPreviewLoading.value = true;
			_fetchPreview();
		} else {
			isPreviewLoading.value = false;
			compiled('');
		}
	}
);

async function _fetchPreview() {
	if (previewTimeout.value) {
		clearTimeout(previewTimeout.value);
	}

	previewTimeout.value = setTimeout(async () => {
		const nextPreviewIndex = previewIndex.value + 1;
		const response = await Api.sendRequest(
			'/web/dash/sites/content-preview',
			{ content: contentBlock.value.content_markdown },
			{ ignorePayloadUser: true }
		);

		if (nextPreviewIndex === previewIndex.value) {
			isPreviewLoading.value = false;
			if (response && response.success !== false && response.compiled) {
				compiled(response.compiled);
			}
		}

		previewTimeout.value = null;
	}, PreviewDebounce);
}

function compiled(compiledContent: string) {
	contentBlock.value.content_compiled = compiledContent;
	refresh();
}

function refresh() {
	const iframe = document.getElementById(windowId.value) as HTMLIFrameElement | undefined;
	if (iframe && iframe.contentWindow) {
		const msg = {
			type: 'content-update',
			block: toRaw(contentBlock.value),
		};
		iframe.contentWindow.postMessage(msg, '*');
	}
}

// Pulled from: http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
function insertAtCaret(text: string) {
	if (!rootElem.value) {
		return;
	}

	const txtarea = rootElem.value.getElementsByTagName('textarea')[0];
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

	contentBlock.value.content_markdown = txtarea.value;
}
</script>

<template>
	<div ref="rootElem" class="content-block-editor">
		<div class="container">
			<div class="row">
				<div class="col-xs-9">
					<p>
						<strong>
							{{ $gettext(`Insert Widgets`) }}
						</strong>
						{{ ' ' }}
						<span class="text-muted small">
							{{ $gettext(`embed dynamic content`) }}
						</span>
					</p>

					<template v-if="!site.game_id">
						<AppButton
							v-app-tooltip="$gettext('Will show your profile bio.')"
							@click="insertAtCaret('{% user-bio %}')"
						>
							{{ $gettext(`User Bio`) }}
						</AppButton>
						<AppButton
							v-app-tooltip="$gettext('Will show a grid of all your games.')"
							@click="insertAtCaret('{% game-list %}')"
						>
							{{ $gettext(`Game List`) }}
						</AppButton>
						<AppButton
							trans
							:href="Environment.helpBaseUrl + '/widgets-user-site'"
							target="_blank"
						>
							{{ $gettext(`View all`) }}
						</AppButton>
					</template>
					<template v-else>
						<AppButton
							v-app-tooltip="
								$gettext(`Will show your game's media (screenshots, videos, etc).`)
							"
							@click="insertAtCaret('{% game-media num=6 %}')"
						>
							{{ $gettext(`Game Media`) }}
						</AppButton>
						<AppButton
							v-app-tooltip="$gettext('Will show your game\'s description.')"
							@click="insertAtCaret('{% game-description %}')"
						>
							{{ $gettext(`Game Description`) }}
						</AppButton>
						<AppButton
							v-app-tooltip="$gettext('Will show your game\'s packages.')"
							@click="insertAtCaret('{% game-packages %}')"
						>
							{{ $gettext(`Game Packages`) }}
						</AppButton>
						<AppButton
							trans
							:href="Environment.helpBaseUrl + '/widgets-game-site'"
							target="_blank"
						>
							{{ $gettext(`View all`) }}
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
