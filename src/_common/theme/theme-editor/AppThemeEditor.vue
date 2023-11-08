<script lang="ts" setup>
import { PropType, nextTick, ref, toRaw, toRefs, watch } from 'vue';
import { Api } from '../../api/api.service';
import AppColorpicker from '../../colorpicker/AppColorpicker.vue';
import AppLoading from '../../loading/AppLoading.vue';
import { SiteTemplateModel } from '../../site/template/template-model';
import { $gettext } from '../../translate/translate.service';
import AppThemeEditorFontSelector from './AppThemeEditorFontSelector.vue';
import AppThemeEditorImage from './AppThemeEditorImage.vue';

interface StyleGroup {
	name: string;
	sections: {
		section: string;
		definitions: string[];
	}[];
}

const props = defineProps({
	windowId: {
		type: String,
		required: true,
	},
	template: {
		type: Number,
		required: true,
	},
	theme: {
		type: Object as PropType<any>,
		required: true,
	},
	resourceId: {
		type: Number,
		required: true,
	},
});

const emit = defineEmits({
	change: (_theme: any) => true,
});

const { windowId, template, theme, resourceId } = toRefs(props);

const isLoaded = ref(false);

const selectedGroup = ref<StyleGroup>(null as any);
const templateObj = ref<SiteTemplateModel>({} as any);
const definition = ref<any>({});

const response = await Api.sendRequest('/sites-io/get-template/' + template.value, undefined, {
	detach: true,
});

isLoaded.value = true;

templateObj.value = new SiteTemplateModel(response.template);
definition.value = templateObj.value.data;
selectedGroup.value = definition.value.styleGroups[0];

// Make sure we update the page with the current theme.
refresh(true);

watch(
	() => theme.value,
	() => refresh(),
	{ deep: true }
);

async function refresh(initial = false) {
	// Gotta wait for the value to be saved.
	await nextTick();

	const iframe = document.getElementById(windowId.value) as HTMLIFrameElement | undefined;
	if (iframe && iframe.contentWindow) {
		const msg = {
			type: 'theme-update',
			template: toRaw(templateObj.value),
			definition: toRaw(definition.value),
			theme: toRaw(theme.value),
		};

		iframe.contentWindow.postMessage(msg, '*');
	}

	if (!initial) {
		emit('change', theme.value);
	}
}

function updateField(field: string, content?: string) {
	theme.value[field] = content;
	refresh();
}
</script>

<template>
	<div class="theme-editor">
		<AppLoading v-if="!isLoaded" />
		<div v-else>
			<p v-if="definition.styleGroups.length > 1">
				<select v-model="selectedGroup" class="form-control">
					<option
						v-for="group of definition.styleGroups"
						:key="group.name"
						:value="group.name"
					>
						{{ group.name }}
					</option>
				</select>
			</p>

			<form novalidate>
				<div
					v-for="section of selectedGroup.sections"
					:key="section.section"
					class="theme-editor-section"
				>
					<h4>{{ section.section }}</h4>

					<div class="theme-editor-definitions fill-offset">
						<div
							v-for="definitionField of section.definitions"
							:key="definitionField"
							class="form-group"
							:class="
								'theme-editor-definition-' +
								definition.definitions[definitionField].type
							"
						>
							<label class="control-label">
								{{ definition.definitions[definitionField].title }}
							</label>

							<!-- Colopicker -->
							<div
								v-if="definition.definitions[definitionField].type === 'color'"
								class="theme-editor-colorpicker"
							>
								<a
									v-if="!!theme[definitionField]"
									style="float: left"
									class="clear-link"
									@click="updateField(definitionField, undefined)"
								>
									{{ $gettext(`clear`) }}
								</a>
								<AppColorpicker v-model="theme[definitionField]" />
							</div>

							<!-- Image -->
							<AppThemeEditorImage
								v-else-if="definition.definitions[definitionField].type === 'image'"
								v-model="theme[definitionField]"
								type="sites-theme-image"
								:parent-id="resourceId"
							/>

							<!-- Font Family -->
							<AppThemeEditorFontSelector
								v-else-if="
									definition.definitions[definitionField].type === 'fontFamily'
								"
								v-model="theme[definitionField]"
								class="theme-editor-font-family"
							/>

							<!-- Dropdown -->
							<div
								v-else-if="
									definition.definitions[definitionField].type === 'dropdown'
								"
								class="theme-editor-dropdown"
							>
								<select v-model="theme[definitionField]" class="form-control">
									<option
										v-for="option of definition.definitions[definitionField]
											.options"
										:key="option"
										:value="option"
									>
										{{ option }}
									</option>
								</select>
							</div>

							<!-- Background Repeat -->
							<div
								v-else-if="
									definition.definitions[definitionField].type ===
									'backgroundRepeat'
								"
								class="theme-editor-dropdown"
							>
								<select v-model="theme[definitionField]" class="form-control">
									<option :value="undefined">
										{{ $gettext(`Repeat`) }}
									</option>
									<option value="repeat-x">
										{{ $gettext(`Repeat Horizontal`) }}
									</option>
									<option value="repeat-y">
										{{ $gettext(`Repeat Vertical`) }}
									</option>
									<option value="no-repeat">
										{{ $gettext(`Don't Repeat`) }}
									</option>
								</select>
							</div>

							<!-- Background Size -->
							<div
								v-else-if="
									definition.definitions[definitionField].type ===
									'backgroundSize'
								"
								class="theme-editor-dropdown"
							>
								<select v-model="theme[definitionField]" class="form-control">
									<option :value="undefined">
										{{ $gettext(`Auto (Default)`) }}
									</option>
									<option value="cover">
										{{ $gettext(`Cover`) }}
									</option>
									<option value="contain">
										{{ $gettext(`Contain`) }}
									</option>
								</select>
							</div>

							<!-- Background Position -->
							<div
								v-else-if="
									definition.definitions[definitionField].type ===
									'backgroundPosition'
								"
								class="theme-editor-dropdown"
							>
								<select v-model="theme[definitionField]" class="form-control">
									<option :value="undefined">
										{{ $gettext(`Top`) }}
									</option>
									<option value="topLeft">
										{{ $gettext(`Top Left`) }}
									</option>
									<option value="right">
										{{ $gettext(`Right`) }}
									</option>
									<option value="topRight">
										{{ $gettext(`Top Right`) }}
									</option>
									<option value="bottomRight">
										{{ $gettext(`Bottom Right`) }}
									</option>
									<option value="bottom">
										{{ $gettext(`Bottom`) }}
									</option>
									<option value="bottomLeft">
										{{ $gettext(`Bottom Left`) }}
									</option>
									<option value="left">
										{{ $gettext(`Left`) }}
									</option>
									<option value="center">
										{{ $gettext(`Center`) }}
									</option>
								</select>
							</div>

							<!-- CSS Input -->
							<div
								v-else-if="definition.definitions[definitionField].type === 'css'"
								class="theme-editor-code"
							>
								<textarea
									v-model="theme[definitionField]"
									class="form-control"
									rows="15"
								/>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<style lang="stylus" src="./theme-editor.styl" scoped></style>
