<script lang="ts" setup>
import { formatDistanceToNow } from 'date-fns';
import { computed, onUnmounted, PropType, ref, shallowReactive, toRefs } from 'vue';
import { ContextCapabilities } from '../../../../_common/content/content-context';
import { DogtagModel, DogtagType } from '../../../../_common/dogtag/dogtag-model';
import { Environment } from '../../../../_common/environment/environment.service';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlContent from '../../../../_common/form-vue/controls/AppFormControlContent.vue';
import AppFormControlSelect from '../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlTheme from '../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlToggleButton from '../../../../_common/form-vue/controls/toggle-button/AppFormControlToggleButton.vue';
import AppFormControlToggleButtonGroup from '../../../../_common/form-vue/controls/toggle-button/AppFormControlToggleButtonGroup.vue';
import {
	validateAvailability,
	validateContentMaxLength,
	validateMaxLength,
	validateMinLength,
	validateUsername,
} from '../../../../_common/form-vue/validators';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { $saveUser, UserModel } from '../../../../_common/user/user.model';
import { arrayUnique } from '../../../../utils/array';

type FormModel = UserModel & {
	pronoun_dogtags: number[];
};

const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const { user } = toRefs(props);

const emit = defineEmits({
	submit: (_model: UserModel) => true,
});

const { setFormTheme } = useThemeStore();

const usernameChangedOn = ref(0);
const usernameTimeLeft = ref(0);
const usernameDuration = ref('');
const isBioLocked = ref(false);
const bioLengthLimit = ref(5_000);

const bioContentCapabilities = ref(ContextCapabilities.getPlaceholder());

const pronounDogtags = shallowReactive<DogtagModel[]>([]);

const mentionsSettingOptions = computed(() => {
	return [
		{
			value: 2,
			text: $gettext(`No one`),
		},
		{
			value: 0,
			text: $gettext(`People you know`),
		},
		{
			value: 1,
			text: $gettext(`Everyone`),
		},
	];
});

const form: FormController<FormModel> = createForm({
	modelClass: UserModel,
	modelSaveHandler: $saveUser,
	model: user,
	loadUrl: '/web/dash/profile/save',
	reloadOnSubmit: true,
	onLoad(payload) {
		usernameChangedOn.value = payload.usernameChangedOn;
		usernameTimeLeft.value = payload.usernameTimeLeft;

		// Backend doesn't always return our dogtags, so our initial User may
		// not have had any assigned. Just assign the up-to-date user data to
		// our form model.
		if (payload.user) {
			form.formModel.assign(payload.user);
		}

		pronounDogtags.splice(
			0,
			pronounDogtags.length,
			...DogtagModel.populate(payload['dogtags']).filter(
				(i: DogtagModel) => i.type === DogtagType.pronoun
			)
		);

		const selectedPronounTagIds: number[] = [];

		// Check formModel for existing pronoun dogtags we have selected.
		for (const tag of form.formModel.dogtags ?? []) {
			for (const id of tag.ids) {
				if (pronounDogtags.some(i => i.id == id)) {
					selectedPronounTagIds.push(id);
				}
			}
		}

		form.formModel.pronoun_dogtags = arrayUnique(selectedPronounTagIds);

		if (usernameTimeLeft.value) {
			usernameDuration.value = formatDistanceToNow(Date.now() + usernameTimeLeft.value);
		}

		isBioLocked.value = payload.isBioLocked;
		bioLengthLimit.value = payload.bioLengthLimit;
		bioContentCapabilities.value = ContextCapabilities.fromPayloadList(
			payload.contentCapabilities
		);
	},
	onSubmitError(response) {
		if (response?.errors['bio-locked']) {
			isBioLocked.value = true;
		}
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

onUnmounted(() => {
	setFormTheme(null);
});

function onThemeChanged() {
	// Default would be the default theme for site.
	setFormTheme(form.formModel.theme ?? DefaultTheme);
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="theme" :label="$gettext(`Color Theme`)">
			<template #inline-control>
				<AppFormControlTheme @changed="onThemeChanged()" />
			</template>

			<p class="help-block">
				<AppTranslate>
					Setting a theme will change how Game Jolt looks for you. When other people view
					your profile, they'll also be switched to your theme.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormGroup v-if="!usernameTimeLeft" name="username" :label="$gettext(`Username`)">
			<AppFormControl
				type="text"
				:validators="[
					validateMinLength(3),
					validateMaxLength(30),
					validateUsername(),
					validateAvailability({
						url: '/web/dash/profile/check-field-availability/username',
						initVal: user.username,
					}),
				]"
				validate-on-blur
			/>

			<AppFormControlErrors />

			<p class="help-block">
				<AppTranslate>Profile URL:</AppTranslate>
				{{ ' ' }}
				<code>
					<span class="text-muted">{{ Environment.baseUrl }}/@</span>
					<b>{{ form.formModel.username || '_' }}</b>
				</code>
			</p>

			<p class="help-block">
				<AppTranslate>
					Changing your username will change your public profile URL. Any current links to
					your old profile URL will not automatically redirect to your new profile URL.
				</AppTranslate>
			</p>
		</AppFormGroup>
		<div v-else class="form-group">
			<label class="control-label">
				<AppTranslate>Username</AppTranslate>
			</label>

			<p class="form-control-static">{{ form.formModel.username }}</p>

			<p class="help-block">
				<AppTranslate>You can only change your username once a week.</AppTranslate>
				<br />
				<AppTranslate :translate-params="{ duration: usernameDuration }">
					You have %{ duration } left until you can change it again.
				</AppTranslate>
			</p>
		</div>

		<AppFormGroup name="name" :label="$gettext(`Display Name`)" optional>
			<AppFormControl
				type="text"
				:validators="[
					validateMaxLength(100),
					validateAvailability({
						url: '/web/dash/profile/check-field-availability/name',
						initVal: user.name,
					}),
				]"
				validate-on-blur
			/>

			<AppFormControlErrors />

			<p class="help-block">
				<AppTranslate>
					Your display name is an optional personal identifier (such as a company name or
					real name). Unlike usernames, display names can contain spaces and special
					characters.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormGroup
			v-if="pronounDogtags.length > 0"
			name="pronoun_dogtags"
			:label="$gettext(`Pronouns`)"
			optional
		>
			<AppFormControlToggleButtonGroup multi>
				<AppFormControlToggleButton
					v-for="tag of pronounDogtags"
					:key="tag.text"
					:value="tag.id"
				>
					{{ tag.text }}
				</AppFormControlToggleButton>
			</AppFormControlToggleButtonGroup>

			<AppFormControlErrors />

			<p class="help-block">
				<AppTranslate>
					You can select multiple pronouns. Multiple pronouns will show in the order you
					select them.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormGroup name="bio_content" :label="$gettext(`Profile Bio`)" optional>
			<AppFormControlContent
				content-context="user-bio"
				:capabilities="bioContentCapabilities"
				:disabled="isBioLocked"
				:model-data="{
					type: 'resource',
					resource: 'User',
					resourceId: user.id,
				}"
				:model-id="user.id"
				:max-height="0"
				:validators="[validateContentMaxLength(bioLengthLimit)]"
			/>

			<AppFormControlErrors />

			<div v-if="isBioLocked" class="control-errors">
				<p class="help-block error">
					<AppTranslate>
						You cannot edit your bio. It's been flagged as spam.
					</AppTranslate>
				</p>
			</div>
		</AppFormGroup>

		<AppFormGroup name="web_site" :label="$gettext(`Website`)" optional>
			<AppFormControl type="url" :validators="[validateMaxLength(250)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="shouts_enabled" :label="$gettext(`Allow shouts?`)">
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<p class="help-block">
				<AppTranslate>
					Will let people post short comments on your profile page. Turning this off will
					hide any shouts already on the page.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormGroup name="friend_requests_enabled" :label="$gettext(`Allow friend requests?`)">
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<p class="help-block">
				<AppTranslate>
					Allows people to send you friend requests. Friends can use the private chat
					feature to send messages to each other. With this feature turned off, you will
					still be able to send friend requests to other users.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormGroup name="liked_posts_enabled" :label="$gettext(`Show your liked posts?`)">
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<p class="help-block">
				<AppTranslate>
					Will publicly show the posts you've liked on your profile.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormGroup name="mentions_setting" :label="$gettext(`Who can mention you?`)">
			<AppFormControlSelect>
				<option
					v-for="mentionSettingOption of mentionsSettingOptions"
					:key="mentionSettingOption.value"
					:value="mentionSettingOption.value"
				>
					{{ mentionSettingOption.text }}
				</option>
			</AppFormControlSelect>

			<p class="help-block">
				<AppTranslate>
					Select which users you will receive mention notifications from. "People you
					know" are users you follow or are friends with.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormStickySubmit>
			<AppFormButton>
				<AppTranslate>Save Profile</AppTranslate>
			</AppFormButton>
		</AppFormStickySubmit>
	</AppForm>
</template>
