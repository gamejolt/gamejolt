<script lang="ts" setup>
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppButton from '../../../_common/button/AppButton.vue';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import AppContentBlockEditor from '../../../_common/content-block/editor/AppContentBlockEditor.vue';
import { showSuccessGrowl } from '../../../_common/growls/growls.service';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import AppThemeSelector from '../../../_common/theme/selector/AppThemeSelector.vue';
import AppThemeEditor from '../../../_common/theme/theme-editor/AppThemeEditor.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { useSiteEditorStore } from '../../store/index';

const store = useSiteEditorStore();
const router = useRouter();
const route = useRoute();

const tab = computed(() => store.tab.value);
const site = computed(() => store.site.value);
const templates = computed(() => store.siteTemplates.value);
const currentTemplateId = computed(() => store.currentTemplateId.value);
const theme = computed(() => store.siteTheme.value);
const isLoaded = computed(() => store.isLoaded.value);
const isDirty = computed(() => store.isDirty.value);
const siteUrl = computed(() => site.value?.url);
const confirmMessage = computed(() =>
	$gettext('You have unsaved changes. Are you sure you want to discard them?')
);

onMounted(() => {
	router.beforeEach((_to, _from, next) => {
		if (!canLeave()) {
			return next(false);
		}
		store.clearIsDirty();
		next();
	});

	window.onbeforeunload = () => {
		if (isDirty.value) {
			return confirmMessage.value;
		}
	};
});

function themeEdited(themeData: any) {
	store.setThemeData(themeData);
}

function contentEdited() {
	store.setContentEdited();
}

function canLeave() {
	return !isDirty.value || confirm(confirmMessage.value);
}

async function save() {
	const data = {
		template_id: currentTemplateId.value,
		theme: theme.value!.data,
		content_blocks: site.value!.content_blocks,
	};

	store.clearIsDirty();
	await Api.sendRequest(`/web/dash/sites/editor-save/${site.value!.id}`, data, {
		sanitizeComplexData: false,
	});

	showSuccessGrowl($gettext('Your site has been saved.'), $gettext('Site Saved'));
}
</script>

<template>
	<div class="site-editor fill-darkest" :class="'site-editor-tab-' + tab">
		<div class="site-editor-body">
			<AppLoading v-if="!isLoaded" />
			<div v-else>
				<div class="site-editor-nav">
					<nav class="navbar">
						<div class="navbar-left">
							<ul class="navbar-items">
								<li>
									<router-link
										replace
										:to="{
											name: 'editor',
											params: { tab: 'theme' },
											query: route.query,
										}"
										active-class="active"
									>
										<AppTranslate>Customize Theme</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										replace
										:to="{
											name: 'editor',
											params: { tab: 'content' },
											query: route.query,
										}"
										active-class="active"
									>
										<AppTranslate>Edit Content</AppTranslate>
									</router-link>
								</li>
							</ul>
						</div>

						<div class="navbar-center" />

						<div class="navbar-right">
							<div class="navbar-controls">
								<AppButton primary solid @click="save()">
									<AppTranslate>Save</AppTranslate>
								</AppButton>
							</div>
						</div>
					</nav>
				</div>

				<div
					v-if="tab === 'theme'"
					class="site-editor-sidebar fill-dark scrollable anim-fade-enter-left anim-fade-leave-left"
				>
					<div class="well">
						<h3 class="sans-margin-top">
							<AppTranslate>Choose a Theme</AppTranslate>
						</h3>

						<p class="small text-muted">
							<AppTranslate>
								Themes decide the layout and general styling of your site.
							</AppTranslate>
						</p>

						<AppThemeSelector
							:templates="templates"
							:current-template="currentTemplateId"
							@change="store.setTemplateId($event)"
						/>

						<template v-if="!!currentTemplateId">
							<div v-for="templateId of [currentTemplateId]" :key="templateId">
								<AppThemeEditor
									window-id="site-editor-iframe"
									:resource-id="site!.id"
									:template="templateId"
									:theme="theme?.data"
									@change="themeEdited"
								/>
							</div>
						</template>
					</div>
				</div>
				<div
					v-if="tab === 'content'"
					class="site-editor-bottom fill-dark scrollable anim-fade-enter-up anim-fade-leave-down"
				>
					<div class="well">
						<AppContentBlockEditor
							window-id="site-editor-iframe"
							:site="site!"
							:content-block="site!.content_blocks![0]"
							@change="contentEdited"
						/>
					</div>
				</div>

				<div class="site-editor-content">
					<iframe id="site-editor-iframe" :src="siteUrl" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.site-editor
	height: 100vh
	width: 100%
	overflow: hidden
	background-color: transparent

	&-nav
		position: absolute
		top: 0
		left: 0
		right: 0

	&-sidebar
	&-content
		position: absolute
		top: $navbar-height
		bottom: 0

	&-sidebar
		left: 0
		width: 350px

	&-bottom
		position: absolute
		bottom: 0
		left: 0
		right: 0
		height: 40%
		overflow-y: auto
		z-index: 2

	&-content
		right: 0
		left: 0

		.site-editor-tab-theme &
			left: 350px

		.site-editor-tab-content &
			bottom: 40%

		iframe
			display: block
			width: 100%
			height: 100%
			border: 0
</style>
