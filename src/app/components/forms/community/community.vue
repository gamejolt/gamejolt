<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import AppFormControlTheme from '../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';
import { validateUrlPath } from '../../../../_common/form-vue/validators';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { useAppStore } from '../../../store';
import AppPostAddButtonFormControl from '../../post/add-button/AppPostAddButtonFormControl.vue';

class Wrapper extends BaseForm<Community> {}

@Options({
	components: {
		AppPostAddButtonFormControl,
		AppFormControlTheme,
		AppFormControlToggle,
	},
})
export default class FormCommunity extends mixins(Wrapper) implements FormOnSubmitSuccess {
	modelClass = Community;

	store = setup(() => useAppStore());
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
		this.store.joinCommunity(community);

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
	<app-form :controller="form">
		<app-form-group name="name" :label="$gettext(`Name`)">
			<div class="help-block">
				<translate>Choose a short and descriptive name for your community.</translate>
			</div>
			<app-form-control
				type="text"
				:validators="[validateMaxLength(100)]"
				:disabled="method === 'edit' && !formModel.games.length"
			/>
			<app-form-control-errors />
		</app-form-group>

		<!-- URL Path is only editable during community creation -->
		<app-form-group v-if="method === 'add'" name="path" :label="$gettext(`URL Path`)">
			<div class="help-block">
				<p>
					<translate>
						Community URLs should be memorable, unique, and as short as possible.
					</translate>
				</p>
			</div>
			<app-form-control
				prefix="gamejolt.com/c/"
				:validators="[
					validateUrlPath(),
					validateMaxLength(50),
					validateAvailability({
						url: '/web/dash/communities/check-field-availability/path',
					}),
				]"
				:validate-delay="500"
			/>
			<div class="help-block">
				<p>
					<strong>
						<translate>Once a URL path is chosen it cannot be changed!</translate>
					</strong>
				</p>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<!-- Post placeholder text only shows whens editing -->
		<app-form-group
			v-if="method !== 'add'"
			name="post_placeholder_text"
			:label="$gettext(`Post Placeholder`)"
			optional
		>
			<div class="help-block">
				<translate>Customize the placeholder message for post creations.</translate>
			</div>

			<AppPostAddButtonFormControl />

			<app-form-control-errors />
		</app-form-group>

		<!-- Color Theme - only show this in the edit part, not creation -->
		<app-form-group v-if="method !== 'add'" name="theme" :label="$gettext(`Color Theme`)">
			<app-form-control-theme class="pull-right" @changed="onThemeChanged()" />
			<p class="help-block">
				<translate>
					Give your page a splash of color! When people view this community, they'll be
					switched to this theme.
				</translate>
			</p>
		</app-form-group>

		<!-- DISABLED_ALLOW_FIRESIDES -->
		<!-- Temporarely disabled -->
		<!-- <app-form-group name="allow_firesides" :label="$gettext(`Allow community firesides?`)">
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Will allow any member of the community to start a fireside in this community.
				</translate>
			</p>
			<p class="help-block">
				<translate>
					You are able to eject firesides at any time, and blocked users will not be able
					to create any firesides in your community.
				</translate>
			</p>
		</app-form-group> -->

		<app-form-button show-when-valid>
			<translate v-if="method === 'add'">Create</translate>
			<translate v-else>Save Details</translate>
		</app-form-button>
	</app-form>
</template>
