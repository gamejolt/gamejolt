<script lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { setup } from 'vue-class-component';
import { mixins, Options } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppFormControlContent from '../../../../_common/form-vue/controls/AppFormControlContent.vue';
import AppFormControlTheme from '../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad, FormOnSubmitError } from '../../../../_common/form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
	validateUsername,
} from '../../../../_common/form-vue/validators';
import AppLoading from '../../../../_common/loading/loading.vue';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { User } from '../../../../_common/user/user.model';

class Wrapper extends BaseForm<User> {}

@Options({
	components: {
		AppLoading,
		AppExpand,
		AppFormControlTheme,
		AppFormControlToggle,
		AppFormControlContent,
	},
})
export default class FormProfile extends mixins(Wrapper) implements FormOnLoad, FormOnSubmitError {
	modelClass = User;

	themeStore = setup(() => useThemeStore());

	usernameChangedOn = 0;
	usernameTimeLeft = 0;
	usernameDuration = '';
	isBioLocked = false;
	bioLengthLimit = 5_000;

	readonly Environment = Environment;
	readonly validateUsername = validateUsername;
	readonly validateContentRequired = validateContentRequired;
	readonly validateContentMaxLength = validateContentMaxLength;
	readonly validateContentNoActiveUploads = validateContentNoActiveUploads;

	get loadUrl() {
		return '/web/dash/profile/save';
	}

	get mentionsSettingOptions() {
		return [
			{
				value: 2,
				text: this.$gettext(`No one`),
			},
			{
				value: 0,
				text: this.$gettext(`People you know`),
			},
			{
				value: 1,
				text: this.$gettext(`Everyone`),
			},
		];
	}

	created() {
		this.form.reloadOnSubmit = true;
	}

	unmounted() {
		this.themeStore.setFormTheme(null);
	}

	onLoad(payload: any) {
		this.usernameChangedOn = payload.usernameChangedOn;
		this.usernameTimeLeft = payload.usernameTimeLeft;

		if (this.usernameTimeLeft) {
			this.usernameDuration = formatDistanceToNow(Date.now() + this.usernameTimeLeft);
		}

		this.isBioLocked = payload.isBioLocked;
		this.bioLengthLimit = payload.bioLengthLimit;
	}

	onSubmitError(response: any) {
		if (response.errors && response.errors['bio-locked']) {
			this.isBioLocked = true;
		}
	}

	onThemeChanged() {
		// Default would be the default theme for site.
		this.themeStore.setFormTheme(this.formModel.theme ?? DefaultTheme);
	}
}
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="theme" :label="$gettext(`Color Theme`)">
			<app-form-control-theme class="pull-right" @changed="onThemeChanged()" />
			<p class="help-block">
				<translate>
					Setting a theme will change how Game Jolt looks for you. When other people view
					your profile, they'll also be switched to your theme.
				</translate>
			</p>
		</app-form-group>

		<app-form-group
			v-if="!usernameTimeLeft"
			name="username"
			:label="$gettext(`dash.profile.edit.username_label`)"
		>
			<app-form-control
				type="text"
				:validators="[
					validateMinLength(3),
					validateMaxLength(30),
					validateUsername(),
					validateAvailability({
						url: '/web/dash/profile/check-field-availability/username',
						initVal: model.username,
					}),
				]"
				:validate-on="['blur']"
			/>

			<app-form-control-errors />

			<p class="help-block">
				<translate>Profile URL</translate>
				{{ ' ' }}
				<code>
					{{ Environment.baseUrl }}/@<strong>{{ formModel.username || '_' }}</strong>
				</code>
			</p>

			<app-expand :when="formModel.username !== model.username">
				<div class="alert">
					<translate>
						Changing your username will change your public profile URL. Any current
						links to your old profile URL will not automatically redirect to your new
						profile URL.
					</translate>
				</div>
			</app-expand>
		</app-form-group>

		<div v-else class="form-group">
			<label class="control-label">
				<translate>dash.profile.edit.username_label</translate>
			</label>
			<p class="form-control-static">{{ formModel.username }}</p>
			<p class="help-block">
				<translate>You can only change your username once a week.</translate>
				<br />
				<translate :translate-params="{ duration: usernameDuration }">
					You have %{ duration } left until you can change it again.
				</translate>
			</p>
		</div>

		<app-form-group
			name="name"
			:label="$gettext(`dash.profile.edit.display_name_label`)"
			:optional="true"
		>
			<app-form-control
				type="text"
				:validators="[
					validateMaxLength(100),
					validateAvailability({
						url: '/web/dash/profile/check-field-availability/name',
						initVal: model.name,
					}),
				]"
				:validate-on="['blur']"
			/>

			<app-form-control-errors />

			<p class="help-block">
				<translate>
					Your display name is an optional personal identifier (such as a company name or
					real name). Unlike usernames, display names can contain spaces and special
					characters.
				</translate>
			</p>
		</app-form-group>

		<app-form-group
			name="web_site"
			:label="$gettext(`dash.profile.edit.website_label`)"
			:optional="true"
		>
			<app-form-control type="url" :validators="[validateMaxLength(250)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="bio_content"
			:label="$gettext(`dash.profile.edit.description_label`)"
			:optional="true"
		>
			<app-form-control-content
				content-context="user-bio"
				:disabled="isBioLocked"
				:model-id="model.id"
				:max-height="0"
				:validators="[validateContentMaxLength(bioLengthLimit)]"
			/>

			<app-form-control-errors />

			<div v-if="isBioLocked" class="control-errors">
				<p class="help-block error">
					<translate>You cannot edit your bio. It's been flagged as spam.</translate>
				</p>
			</div>
		</app-form-group>

		<app-form-group name="shouts_enabled" :label="$gettext(`Allow shouts?`)">
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Will let people post short comments on your profile page. Turning this off will
					hide any shouts already on the page.
				</translate>
			</p>
		</app-form-group>

		<app-form-group name="friend_requests_enabled" :label="$gettext(`Allow friend requests?`)">
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Allows people to send you friend requests. Friends can use the private chat
					feature to send messages to each other. With this feature turned off, you will
					still be able to send friend requests to other users.
				</translate>
			</p>
		</app-form-group>

		<app-form-group name="liked_posts_enabled" :label="$gettext(`Show your liked posts?`)">
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>Will publicly show the posts you've liked on your profile.</translate>
			</p>
		</app-form-group>

		<app-form-group name="mentions_setting" :label="$gettext(`Who can mention you?`)">
			<app-form-control-select>
				<option
					v-for="mentionSettingOption of mentionsSettingOptions"
					:key="mentionSettingOption.value"
					:value="mentionSettingOption.value"
				>
					{{ mentionSettingOption.text }}
				</option>
			</app-form-control-select>

			<p class="help-block">
				<translate>
					Select which users you will receive mention notifications from. "People you
					know" are users you follow or are friends with.
				</translate>
			</p>
		</app-form-group>

		<app-form-button>
			<translate>dash.profile.edit.submit_button</translate>
		</app-form-button>
	</app-form>
</template>
