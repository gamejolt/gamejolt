<script lang="ts" setup>
import { onUnmounted, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { $saveCommunity, CommunityModel } from '../../../../_common/community/community.model';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlTheme from '../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import {
	validateAvailability,
	validateMaxLength,
	validateUrlPath,
} from '../../../../_common/form-vue/validators';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { useAppStore } from '../../../store';
import { useGridStore } from '../../grid/grid-store';
import AppPostAddButtonFormControl from '../../post/add-button/AppPostAddButtonFormControl.vue';

interface FormCommunityModel extends CommunityModel {
	name: string;
	path: string;
	post_placeholder_text: string | null;
}

const props = defineProps({
	...defineFormProps<CommunityModel>(),
});

const { joinCommunity } = useAppStore();
const { grid } = useGridStore();
const { userTheme, setFormTheme } = useThemeStore();
const router = useRouter();

const form: FormController<FormCommunityModel> = createForm({
	model: toRef(props, 'model'),
	modelClass: CommunityModel,
	modelSaveHandler: $saveCommunity,
	onInit() {
		form.warnOnDiscard = form.method === 'edit';
	},
	onSubmitSuccess(response: any) {
		if (form.method !== 'add') {
			return;
		}

		const community = new CommunityModel(response.community);

		// When creating a community you get auto joined to it,
		// but aside from the actual join operation we also do other things
		// in this store action so we gotta call it anyways.
		joinCommunity(community, { grid: grid.value });

		router.push(community.routeEditLocation);
	},
});

onUnmounted(() => {
	setFormTheme(null);
});

function onThemeChanged() {
	// Default theme would be the user theme. Don't want to fallback to page theme otherwise
	// when clearing theme it'll show the page theme.
	setFormTheme(form.formModel.theme ?? userTheme.value ?? DefaultTheme);
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="name" :label="$gettext(`Name`)">
			<div class="help-block">
				{{ $gettext(`Choose a short and descriptive name for your community.`) }}
			</div>
			<AppFormControl type="text" :validators="[validateMaxLength(100)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<!-- URL Path is only editable during community creation -->
		<AppFormGroup v-if="form.method === 'add'" name="path" :label="$gettext(`URL Path`)">
			<div class="help-block">
				<p>
					{{
						$gettext(
							`Community URLs should be memorable, unique, and as short as possible.`
						)
					}}
				</p>
			</div>
			<AppFormControlPrefix prefix="gamejolt.com/c/">
				<AppFormControl
					:validators="[
						validateUrlPath(),
						validateMaxLength(50),
						validateAvailability({
							url: '/web/dash/communities/check-field-availability/path',
						}),
					]"
					:validate-delay="500"
				/>
			</AppFormControlPrefix>

			<div class="help-block">
				<p>
					<strong>
						{{ $gettext(`Once a URL path is chosen it cannot be changed!`) }}
					</strong>
				</p>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<!-- Post placeholder text only shows whens editing -->
		<AppFormGroup
			v-if="form.method !== 'add'"
			name="post_placeholder_text"
			:label="$gettext(`Post Placeholder`)"
			optional
		>
			<div class="help-block">
				{{ $gettext(`Customize the placeholder message for post creations.`) }}
			</div>

			<AppPostAddButtonFormControl />

			<AppFormControlErrors />
		</AppFormGroup>

		<!-- Color Theme - only show this in the edit part, not creation -->
		<AppFormGroup v-if="form.method !== 'add'" name="theme" :label="$gettext(`Color Theme`)">
			<template #inline-control>
				<AppFormControlTheme @changed="onThemeChanged()" />
			</template>

			<p class="help-block">
				{{
					$gettext(
						`Give your page a splash of color! When people view this community, they'll be switched to this theme.`
					)
				}}
			</p>
		</AppFormGroup>

		<AppFormButton show-when-valid>
			<span v-if="form.method === 'add'">{{ $gettext(`Create`) }}</span>
			<span v-else>{{ $gettext(`Save Details`) }}</span>
		</AppFormButton>
	</AppForm>
</template>
