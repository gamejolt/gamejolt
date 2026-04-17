<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlSelect from '~common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlTextarea from '~common/form-vue/controls/AppFormControlTextarea.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '~common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateFilesize,
	validateImageMaxDimensions,
	validateMaxLength,
} from '~common/form-vue/validators';
import { GameModel } from '~common/game/game.model';
import {
	$clearGameTrophyImage,
	$saveGameTrophy,
	GameTrophyModel,
} from '~common/game/trophy/trophy.model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';
import { BaseTrophyDifficulty } from '~common/trophy/base-trophy.model';

type FormModel = GameTrophyModel;

type Props = {
	game: GameModel;
	difficulty: number;
	model?: GameTrophyModel;
};

const props = defineProps<Props>();
const { game, difficulty } = props;

const emit = defineEmits<{
	submit: [trophy: GameTrophyModel];
}>();

const maxFilesize = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(props, 'model'),
	modelClass: GameTrophyModel,
	modelSaveHandler: $saveGameTrophy,
	resetOnSubmit: true,
	loadUrl: computed(() => `/web/dash/developer/games/api/trophies/save/${game.id}`),
	onInit() {
		form.formModel.game_id = game.id;

		// If we're adding, set some defaults.
		if (form.method === 'add') {
			form.formModel.difficulty = difficulty;
			form.formModel.secret = false;
		}
	},
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		maxWidth.value = payload.maxWidth;
		maxHeight.value = payload.maxHeight;
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const difficultyOptions = computed(() => [
	{ label: $gettext('Bronze'), value: BaseTrophyDifficulty.Bronze },
	{ label: $gettext('Silver'), value: BaseTrophyDifficulty.Silver },
	{ label: $gettext('Gold'), value: BaseTrophyDifficulty.Gold },
	{ label: $gettext('Platinum'), value: BaseTrophyDifficulty.Platinum },
]);

async function clearImage() {
	const result = await showModalConfirm(
		$gettext('Are you sure you want to clear this trophy image?')
	);

	if (!result) {
		return;
	}

	// It's important we save on the base model!
	await $clearGameTrophyImage(props.model!);

	// Copy just the differences that we want.
	form.formModel.has_thumbnail = props.model!.has_thumbnail;
	form.formModel.img_thumbnail = props.model!.img_thumbnail;
}
</script>

<template>
	<AppForm :controller="form">
		<!--
			Show the current image if there is one.
		-->
		<div v-if="form.formModel.has_thumbnail" class="form-group">
			<label class="control-label">
				<AppTranslate>Current Trophy Image</AppTranslate>
			</label>

			<AppImgResponsive
				:src="form.formModel.img_thumbnail"
				:alt="$gettext('Current Trophy Image')"
			/>

			<br />

			<div class="clearfix">
				<AppButton @click="clearImage">
					<AppTranslate>Clear Image</AppTranslate>
				</AppButton>
			</div>
		</div>

		<!-- TODO(vue3) translate-comment="Refers to a difficulty level. How easy/hard it is to accomplish." -->
		<AppFormGroup
			v-if="form.method === 'edit'"
			name="difficulty"
			:label="$gettext(`Difficulty`)"
		>
			<AppFormControlSelect>
				<option v-for="item of difficultyOptions" :key="item.label" :value="item.value">
					{{ item.label }}
				</option>
			</AppFormControlSelect>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			name="file"
			:label="
				!form.formModel.has_thumbnail
					? $gettext('Trophy Image')
					: $gettext('Change Trophy Image')
			"
			:optional="true"
		>
			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>

			<p class="help-block">
				<a class="link-help">
					<AppTranslate>Learn more about trophy images...</AppTranslate>
				</a>
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
			/>

			<AppFormControlErrors :label="$gettext(`trophy image`)" />
		</AppFormGroup>

		<AppFormGroup name="title" :label="$gettext(`Title`)">
			<AppFormControl type="text" :validators="[validateMaxLength(150)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="description" :label="$gettext(`Description`)">
			<AppFormControlTextarea rows="3" :validators="[validateMaxLength(1500)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="secret" :label="$gettext(`Secret`)">
			<p class="help-block">
				<AppTranslate>
					Secret trophies hide everything but their titles from players until they are
					achieved.
				</AppTranslate>
			</p>
			<AppFormControlToggle />
		</AppFormGroup>

		<AppFormGroup name="visible" :label="$gettext(`Visible`)">
			<p class="help-block">
				<AppTranslate>
					Hidden trophies are invisible to everyone but the game's developer, for testing
					and other nefarious reasons.
				</AppTranslate>
			</p>
			<AppFormControlToggle />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Save Trophy</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
