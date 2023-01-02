<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import AppFormControlPrefix from '../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormControlTheme from '../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';
import { validateUrlPath } from '../../../../_common/form-vue/validators';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { useAppStore } from '../../../store';
import { useGridStore } from '../../grid/grid-store';
import AppPostAddButtonFormControl from '../../post/add-button/AppPostAddButtonFormControl.vue';

class Wrapper extends BaseForm<Community> {}

@Options({
	components: {
		AppPostAddButtonFormControl,
		AppFormControlTheme,
		AppFormControlPrefix,
	},
})
export default class FormCommunity extends mixins(Wrapper) implements FormOnSubmitSuccess {
	modelClass = Community;

	store = setup(() => useAppStore());
	gridStore = setup(() => useGridStore());
	themeStore = setup(() => useThemeStore());

	readonly validateUrlPath = validateUrlPath;

	created() {
		this.form.warnOnDiscard = this.method === 'edit';
	}

	onSubmitSuccess(response: any) {
		if (this.method !== 'add') {
			return;
		}

		const community = new Community(response.community);

		// When creating a community you get auto joined to it,
		// but aside from the actual join operation we also do other things
		// in this store action so we gotta call it anyways.
		this.store.joinCommunity(community, { grid: this.gridStore.grid });

		this.$router.push(community.routeEditLocation);
	}

	onPostPlaceholderChange(placeholder: string) {
		this.setField('post_placeholder_text', placeholder || null);
	}

	unmounted() {
		this.themeStore.setFormTheme(null);
	}

	onThemeChanged() {
		// Default theme would be the user theme. Don't want to fallback to page theme otherwise
		// when clearing theme it'll show the page theme.
		this.themeStore.setFormTheme(
			this.formModel.theme ?? this.themeStore.userTheme ?? DefaultTheme
		);
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="name" :label="$gettext(`Name`)">
			<div class="help-block">
				<AppTranslate>Choose a short and descriptive name for your community.</AppTranslate>
			</div>
			<AppFormControl type="text" :validators="[validateMaxLength(100)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<!-- URL Path is only editable during community creation -->
		<AppFormGroup v-if="method === 'add'" name="path" :label="$gettext(`URL Path`)">
			<div class="help-block">
				<p>
					<AppTranslate>
						Community URLs should be memorable, unique, and as short as possible.
					</AppTranslate>
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
						<AppTranslate>Once a URL path is chosen it cannot be changed!</AppTranslate>
					</strong>
				</p>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<!-- Post placeholder text only shows whens editing -->
		<AppFormGroup
			v-if="method !== 'add'"
			name="post_placeholder_text"
			:label="$gettext(`Post Placeholder`)"
			optional
		>
			<div class="help-block">
				<AppTranslate>Customize the placeholder message for post creations.</AppTranslate>
			</div>

			<AppPostAddButtonFormControl />

			<AppFormControlErrors />
		</AppFormGroup>

		<!-- Color Theme - only show this in the edit part, not creation -->
		<AppFormGroup v-if="method !== 'add'" name="theme" :label="$gettext(`Color Theme`)">
			<template #inline-control>
				<AppFormControlTheme @changed="onThemeChanged()" />
			</template>

			<p class="help-block">
				<AppTranslate>
					Give your page a splash of color! When people view this community, they'll be
					switched to this theme.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton show-when-valid>
			<AppTranslate v-if="method === 'add'">Create</AppTranslate>
			<AppTranslate v-else>Save Details</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
