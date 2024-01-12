<script lang="ts" setup>
import { PropType, computed, onMounted, ref, toRefs } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { Api } from '../../api/api.service';
import { FiresidePostModel } from '../../fireside/post/post-model';
import AppForm, { FormController, createForm, defineFormEmits } from '../../form-vue/AppForm.vue';
import AppFormButton from '../../form-vue/AppFormButton.vue';
import AppFormControl from '../../form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../form-vue/AppFormGroup.vue';
import AppFormControlCheckbox from '../../form-vue/controls/AppFormControlCheckbox.vue';
import AppFormControlRadio from '../../form-vue/controls/AppFormControlRadio.vue';
import AppFormControlTextarea from '../../form-vue/controls/AppFormControlTextarea.vue';
import { validateMaxLength } from '../../form-vue/validators';
import { GameModel } from '../../game/game.model';
import { $gettext } from '../../translate/translate.service';

interface FormModel {
	reason: string;
	context: string[];
	description: string;
	source: string;
}

const props = defineProps({
	type: {
		type: String,
		required: true,
	},
	resource: {
		type: Object as PropType<any>,
		required: true,
	},
});

const emit = defineEmits({
	...defineFormEmits<FormModel>(),
});

const { type, resource } = toRefs(props);

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	loadUrl: '/web/report',
	onSubmit() {
		const data = {
			resourceName: type.value,
			resourceId: resource.value.id,
			reason: form.formModel.reason,
			context: form.formModel.context as string[] | undefined,
			description: form.formModel.description,
			source: form.formModel.source as string | undefined,
		};

		// Clear out context if the current reason doesn't have a context option.
		if (!data.context || !reasons.value.find(i => i.radioValue === data.reason)!.contexts) {
			delete (data as any).context;
		}

		// Clear out source if the current reason doesn't have a source option.
		if (!data.source || !reasons.value.find(i => i.radioValue === data.reason)!.source) {
			delete (data as any).source;
		}

		return Api.sendRequest('/web/report/submit', data, {
			allowComplexData: ['context'],
		});
	},
	onLoad(payload: any) {
		maxLengthDescription.value = payload.maxLengthDescription;
		maxLengthSource.value = payload.maxLengthSource;
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const maxLengthDescription = ref(200);
const maxLengthSource = ref(255);

const isDescriptionOptional = computed(() => {
	if (!form.formModel.reason) {
		return true;
	}

	// When "other" is selected as reason, they have to provide a description.
	if (form.formModel.reason === 'other') {
		return false;
	}

	// When "other" is selected as context, they have to provide a description.
	if (form.formModel.context && form.formModel.context.includes('other')) {
		return false;
	}

	return true;
});

interface Reason {
	radioValue: string;
	text: string;
	contexts?: {
		checkValue: string;
		text: string;
	}[];
	source?: {
		placeholder: string;
	};
}

const reasons = computed<Reason[]>(() => {
	switch (type.value) {
		case 'Game':
			return [
				{
					radioValue: 'spam',
					text: $gettext('It is spam or unwanted commercial content'),
				},
				{
					radioValue: 'abuse',
					text: $gettext('Incorrect maturity rating for the content in the game'),
				},
				{
					radioValue: 'explicit',
					text: $gettext('It is pornographic or contains sexually explicit material'),
				},
				{
					radioValue: 'stolen',
					text: $gettext('Game does not belong to this developer'),
					source: {
						placeholder: $gettext('Tell us where this game was stolen from'),
					},
				},
				{
					radioValue: 'no-info',
					text: $gettext(
						'No information on game page (no screenshots, sparse description, placeholder page, etc.)'
					),
				},
				{
					radioValue: 'malware',
					text: $gettext('Virus or other form of malware'),
				},
				{
					radioValue: 'other',
					text: $gettext('Other'),
				},
			] satisfies Reason[];

		case 'Fireside_Post': {
			const reasons = [
				{
					radioValue: 'spam',
					text: $gettext('It is spam or unwanted commercial content'),
				},
				{
					radioValue: 'abuse',
					text: $gettext('It is hate speech or contains graphic content'),
				},
				{
					radioValue: 'explicit',
					text: $gettext('It is pornographic or contains sexually explicit material'),
				},
				{
					radioValue: 'harassment',
					text: $gettext('It is harassment or bullying'),
				},
				{
					radioValue: 'stolen',
					text: $gettext('Content in this post does not belong to the author'),
					source: {
						placeholder: $gettext('Tell us where content in this post was stolen from'),
					},
				},
				{
					radioValue: 'other',
					text: $gettext('Other'),
				},
			] satisfies Reason[];

			// For a devlog post of a game that is maturity restricted, we don't want to show the "explicit" report option.
			// Those devlog posts can be explicit, and we don't want to encourage false reports.
			const isAdultGamePost =
				resource.value instanceof FiresidePostModel &&
				resource.value.game instanceof GameModel &&
				resource.value.game.tigrs_age === 3;

			// However, in cases where the post may be shown outside of the game page, we won't disable reporting.
			const onlyShowsOnGame =
				!resource.value.post_to_user_profile && resource.value.communities.length === 0;

			if (isAdultGamePost && onlyShowsOnGame) {
				arrayRemove(reasons, i => i.radioValue === 'explicit');
			}

			return reasons;
		}
		case 'Comment':
		case 'Forum_Topic':
		case 'Forum_Post':
			return [
				{
					radioValue: 'spam',
					text: $gettext('It is spam or unwanted commercial content'),
				},
				{
					radioValue: 'abuse',
					text: $gettext('It is hate speech or contains graphic content'),
				},
				{
					radioValue: 'explicit',
					text: $gettext('It is pornographic or contains sexually explicit material'),
				},
				{
					radioValue: 'harassment',
					text: $gettext('It is harassment or bullying'),
				},
				{
					radioValue: 'other',
					text: $gettext('Other'),
				},
			] satisfies Reason[];

		case 'Community':
			return [
				{
					radioValue: 'spam',
					text: $gettext(`It is spam or unwanted commercial content`),
				},
				{
					radioValue: 'abuse',
					text: $gettext('Encourages posting of hate speech or graphic content'),
				},
				{
					radioValue: 'harassment',
					text: $gettext(
						`This community is used to create targeted harassment or bullying`
					),
				},
				{
					radioValue: 'no-moderation',
					text: $gettext('This community is not actively moderated by its moderators'),
				},
				{
					radioValue: 'other',
					text: $gettext('Other'),
				},
			] satisfies Reason[];

		case 'User':
			return [
				{
					radioValue: 'spam',
					text: $gettext('Spammer'),
					contexts: [
						{
							checkValue: 'user/posts',
							text: $gettext('Posts'),
						},
						{
							checkValue: 'user/comments',
							text: $gettext('Comments'),
						},
						{
							checkValue: 'user/games',
							text: $gettext('Games'),
						},
						{
							checkValue: 'user/chat',
							text: $gettext('Chat Messages'),
						},
						{
							checkValue: 'user/bio',
							text: $gettext('Bio'),
						},
						{
							checkValue: 'user/website',
							text: $gettext('Website'),
						},
						{
							checkValue: 'other',
							text: $gettext('Other (please describe below)'),
						},
					],
				},
				{
					radioValue: 'explicit',
					text: $gettext('Profile or username contains explicit or sensitive material'),
					contexts: [
						{
							checkValue: 'user/header',
							text: $gettext('Header'),
						},
						{
							checkValue: 'user/avatar',
							text: $gettext('Avatar'),
						},
						{
							checkValue: 'user/name',
							text: $gettext('Username or display name'),
						},
						{
							checkValue: 'user/posts',
							text: $gettext('Posts'),
						},
						{
							checkValue: 'user/comments',
							text: $gettext('Comments'),
						},
						{
							checkValue: 'user/chat',
							text: $gettext('Chat Messages'),
						},
						{
							checkValue: 'user/bio',
							text: $gettext('Bio'),
						},
						{
							checkValue: 'user/website',
							text: $gettext('Website or socials'),
						},
						{
							checkValue: 'other',
							text: $gettext('Other (please describe below)'),
						},
					],
				},
				{
					radioValue: 'harassment',
					text: $gettext('This user is harassing or bullying others'),
					contexts: [
						{
							checkValue: 'user/posts',
							text: $gettext('Posts'),
						},
						{
							checkValue: 'user/comments',
							text: $gettext('Comments'),
						},
						{
							checkValue: 'user/chat',
							text: $gettext('Chat Messages'),
						},
						{
							checkValue: 'user/bio',
							text: $gettext('Bio'),
						},
						{
							checkValue: 'other',
							text: $gettext('Other (please describe below)'),
						},
					],
				},
				{
					radioValue: 'impersonation',
					text: $gettext('Impersonating'),
					source: {
						placeholder: $gettext('Tell us which person this user is impersonating'),
					},
				},
				{
					radioValue: 'other',
					text: $gettext('Other'),
				},
			] satisfies Reason[];
	}

	throw new Error('Resource has no reasons defined.');
});

onMounted(async () => {
	const payload = await Api.sendRequest('/web/report');

	maxLengthDescription.value = payload.maxLengthDescription;
	maxLengthSource.value = payload.maxLengthSource;
});

function onChangeReason() {
	form.formModel.context = [];
	validateContextSelected();
}

function onChangeContext() {
	validateContextSelected();
}

function validateContextSelected() {
	let hasErrors = false;

	// Check that if we have contexts to choose from, at least one of them is selected.
	if (form.formModel.reason) {
		const reason = reasons.value.find(i => i.radioValue === form.formModel.reason);
		if (!reason) {
			throw new Error('Invalid reason selected.');
		}
		if (reason.contexts && reason.contexts.length > 0) {
			if (!form.formModel.context || form.formModel.context.length === 0) {
				hasErrors = true;
			}
		}
	}

	if (hasErrors) {
		form.setCustomError('context');
	} else {
		form.clearCustomError('context');
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="reason" :label="$gettext(`What's the reason?`)">
			<div v-for="reason of reasons" :key="reason.radioValue">
				<div class="radio">
					<label>
						<AppFormControlRadio :value="reason.radioValue" @changed="onChangeReason" />
						{{ reason.text }}
					</label>
				</div>

				<div v-if="form.formModel.reason === reason.radioValue && !!reason.source">
					<AppFormGroup name="source" hide-label>
						<AppFormControl
							type="text"
							:validators="[validateMaxLength(maxLengthSource)]"
							:placeholder="reason.source.placeholder"
						/>

						<AppFormControlErrors />
					</AppFormGroup>
				</div>

				<div
					v-if="form.formModel.reason === reason.radioValue && !!reason.contexts"
					:style="{ marginLeft: `32px` }"
				>
					<AppFormGroup
						name="context"
						:label="$gettext(`Select one or more options that the report applies to`)"
					>
						<div
							v-for="context of reason.contexts"
							:key="context.checkValue"
							class="checkbox"
						>
							<label>
								<AppFormControlCheckbox
									:value="context.checkValue"
									@changed="onChangeContext"
								/>

								{{ context.text }}
							</label>
						</div>

						<AppFormControlErrors />
					</AppFormGroup>
				</div>
			</div>
		</AppFormGroup>

		<AppFormGroup
			name="description"
			:label="$gettext(`Describe your report`)"
			:optional="isDescriptionOptional"
		>
			<AppFormControlTextarea :validators="[validateMaxLength(maxLengthDescription)]" />

			<AppFormControlErrors :label="$gettext(`description`)" />
		</AppFormGroup>

		<AppFormButton :disabled="!form.valid">
			{{ $gettext(`Send Report`) }}
		</AppFormButton>
	</AppForm>
</template>
