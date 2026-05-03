<script lang="ts" setup>
import { computed, type Ref, ref, toRef, watch } from 'vue';

import AppExpand from '~common/expand/AppExpand.vue';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlUpload from '~common/form-vue/controls/upload/AppFormControlUpload.vue';
import { validateFilesize } from '~common/form-vue/validators';
import {
	$saveGameBuild,
	GameBuildModel,
	GameBuildType,
	GameBuildTypeDownloadable,
	GameBuildTypeFlash,
	GameBuildTypeHtml,
	GameBuildTypeRom,
	GameBuildTypeUnity,
} from '~common/game/build/build.model';
import { GameModel } from '~common/game/game.model';
import { GamePackageModel } from '~common/game/package/package.model';
import { GameReleaseModel } from '~common/game/release/release.model';
import AppTranslate from '~common/translate/AppTranslate.vue';

type NewGameBuildFormModel = GameBuildModel & {
	file: File;
};

type Props = {
	type: 'downloadable' | 'browser';
	game: GameModel;
	package: GamePackageModel;
	release: GameReleaseModel;
	builds?: GameBuildModel[];
	model?: GameBuildModel;
};

const props = defineProps<Props>();

const emit = defineEmits<{
	submit: [build: NewGameBuildFormModel];
}>();

const maxFilesize = ref(0);
const restrictedPlatforms = ref<string[]>([]);
const forceOther = ref(false);
const romTypes = ref<string[]>([]);
let browserTypes: { [ext: string]: string } = {};

const form: FormController<NewGameBuildFormModel> = createForm<NewGameBuildFormModel>({
	model: toRef(props, 'model') as Ref<NewGameBuildFormModel | undefined>,
	modelClass: GameBuildModel as any,
	modelSaveHandler: $saveGameBuild,
	reloadOnSubmit: true,
	warnOnDiscard: false,
	loadUrl: computed(
		() =>
			`/web/dash/developer/games/builds/save/${props.game.id}/${props.package.id}/${props.release.id}`
	),
	onInit() {
		// Set the game ID on the form model from the game passed in.
		form.formModel.type = props.type as any;
		form.formModel.game_id = props.game.id;
		form.formModel.game_package_id = props.package.id;
		form.formModel.game_release_id = props.release.id;

		browserTypes = {
			'.zip': GameBuildTypeHtml,
			'.swf': GameBuildTypeFlash,
			'.unity3d': GameBuildTypeUnity,
		};
	},
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		restrictedPlatforms.value = payload.restrictedPlatforms;
		forceOther.value = payload.forceOther;
		romTypes.value = payload.romTypes;

		// ROM types can change, so we pull from server.
		if (romTypes.value) {
			for (const ext of romTypes.value) {
				browserTypes[ext] = GameBuildTypeRom;
			}
		}
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const uploadAccept = computed(() => {
	if (props.type !== 'browser') {
		return undefined;
	}
	return Object.keys(browserTypes).join(',');
});

const browserTypeValid = computed(() => {
	if (props.type !== 'browser' || !props.builds || !form.formModel.file) {
		return true;
	}

	const releaseTypes = props.builds
		.filter(build => build.type !== GameBuildTypeDownloadable)
		.map(build => build.type);

	const accept = Object.entries(browserTypes)
		.filter(entry => {
			return releaseTypes.indexOf(entry[1] as GameBuildType) === -1;
		})
		.map(entry => entry[0]);

	const fileType = form.formModel.file.name.slice(form.formModel.file.name.lastIndexOf('.'));
	return accept.indexOf(fileType) !== -1;
});

const hasBrowserTypeError = computed(() => form.hasCustomError('browserType'));

watch(
	() => form.formModel.file,
	() => {
		if (!browserTypeValid.value) {
			form.setCustomError('browserType');
		} else {
			form.clearCustomError('browserType');
		}
	}
);

function submit() {
	if (!form.formModel.file) {
		return;
	}
	form.submit();
}
</script>

<template>
	<AppForm class="game-new-build-form" :controller="form">
		<!--
		Can only add files. Can't edit builds anymore.
		They need to release a new version to do that.
	-->
		<AppFormGroup
			name="file"
			:label="$gettext('Upload File')"
			:hide-label="true"
			:optional="true"
		>
			<AppFormControlUpload
				:validators="[validateFilesize(maxFilesize)]"
				:accept="uploadAccept"
				@changed="submit"
			/>

			<AppFormControlErrors :label="$gettext(`file`)" />

			<AppExpand :when="hasBrowserTypeError">
				<br />
				<div class="alert alert-notice sans-margin-bottom">
					<AppTranslate>
						You can't upload multiple browser builds of the same type into the same
						release. If you're trying to update your build, add a new release first.
					</AppTranslate>
				</div>
			</AppExpand>

			<p v-if="type === 'browser'" class="help-block">
				<AppTranslate>
					For HTML builds, upload a .zip archive containing all of your build's files and
					assets. There must be an index.html file in the root folder.
				</AppTranslate>
			</p>
		</AppFormGroup>
	</AppForm>
</template>
