<script lang="ts" setup>
import { PropType, computed, ref, toRef, toRefs } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppForm, { FormController, createForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '../../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '../../../../../_common/form-vue/controls/AppFormControlRadio.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import {
	validateAvailability,
	validateMaxLength,
} from '../../../../../_common/form-vue/validators';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { getDatalistOptions } from '../../../../../_common/settings/datalist-options.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import {
	REASON_OTHER,
	REASON_SPAM,
	getCommunityBlockReasons,
} from '../../../../../_common/user/action-reasons';
import { UserModel } from '../../../../../_common/user/user.model';

interface FormModel {
	username: string;
	reasonType: string;
	reason: string;
	expiry: string;
	ejectPosts: boolean;
}

const expiryOptions = {
	hour: $gettext('1 Hour'),
	day: $gettext('1 Day'),
	week: $gettext('1 Week'),
	month: $gettext('1 Month'),
	year: $gettext('1 Year'),
	never: $gettext('Never'),
} as const;

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	user: {
		type: Object as PropType<UserModel>,
		default: undefined,
	},
});

const { community, user } = toRefs(props);

const usernameLocked = ref(false);
const otherOptions = ref<string[]>([]);

const defaultReasons = computed(() => getCommunityBlockReasons());

const showReasonOther = toRef(() => form.formModel.reasonType === REASON_OTHER);

const form: FormController<FormModel> = createForm({
	resetOnSubmit: true,
	onInit() {
		form.formModel.reasonType = REASON_SPAM;
		form.formModel.expiry = 'week';
		form.formModel.ejectPosts = true;

		if (user?.value) {
			form.formModel.username = user.value.username;
			usernameLocked.value = true;
		}

		const options = getDatalistOptions('community-user-block', community.value.id.toString());
		otherOptions.value = options.getList();
	},
	async onSubmit() {
		const response = await Api.sendRequest(
			`/web/dash/communities/blocks/add/${community.value.id}`,
			form.formModel
		);

		if (!response.success) {
			if (response.errors.collaborator) {
				showErrorGrowl({
					title: $gettext('Collaborators cannot be blocked'),
					message: $gettext(
						'%{ user } is a Collaborator on this Community. Remove them from the collaborators list first to block them.',
						{ user: form.formModel.username }
					),
				});
			}
		} else {
			// Add custom options entry to list of options.
			if (form.formModel.reasonType === REASON_OTHER && form.formModel.reason) {
				const options = getDatalistOptions(
					'community-user-block',
					community.value.id.toString()
				);
				options.unshiftItem(form.formModel.reason);
			}

			if (form.formModel.ejectPosts) {
				const whatsRemoved = $gettext('posts');

				const message = $gettext(
					'%{ user } was blocked from this Community. It might take a few moments for their %{ stuff } to disappear.',
					{
						user: form.formModel.username,
						stuff: whatsRemoved,
					}
				);

				showSuccessGrowl({
					message: $gettext(message, {
						user: form.formModel.username,
					}),
				});
			} else {
				showSuccessGrowl({
					message: $gettext('%{ user } was blocked from this Community.', {
						user: form.formModel.username,
					}),
				});
			}
		}

		return response;
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="username">
			<AppFormControlPrefix prefix="@">
				<AppFormControl
					:validators="[
						validateMaxLength(100),
						validateAvailability({
							url: `/web/dash/communities/blocks/check-field-availability/${community.id}`,
						}),
					]"
					validate-on-blur
					:disabled="usernameLocked"
				/>
			</AppFormControlPrefix>

			<AppFormControlErrors :label="$gettext('username')">
				<AppFormControlError
					when="availability"
					:message="$gettext(`This user does not exist.`)"
				/>
			</AppFormControlErrors>
		</AppFormGroup>

		<AppFormGroup name="reasonType" :label="$gettext('Block reason')">
			<div v-for="(reasonDisplay, reason) in defaultReasons" :key="reason" class="radio">
				<label>
					<AppFormControlRadio :value="reason" />
					{{ reasonDisplay }}
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup v-if="showReasonOther" name="reason" hide-label>
			<div class="help-inline">
				<span v-translate>
					Enter other block reason.
					<b>This is shown to the blocked user.</b>
				</span>
			</div>
			<AppFormControl
				html-list-id="block-user-reasons-list"
				:validators="[validateMaxLength(100)]"
			/>
			<datalist id="block-user-reasons-list">
				<option v-for="optionStr of otherOptions" :key="optionStr" :value="optionStr" />
			</datalist>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="expiry" :label="$gettext('Block expires in...')">
			<div v-for="(expiryDisplay, expiry) in expiryOptions" :key="expiry" class="radio">
				<label>
					<AppFormControlRadio :value="expiry" />
					{{ expiryDisplay }}
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="ejectPosts" :label="$gettext(`Eject user's posts from the community?`)">
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<p class="help-block">
				{{
					$gettext(
						`Once the user is blocked, all their posts will be ejected from the community.`
					)
				}}
				<br />
				{{ $gettext(`This also affects their featured posts.`) }}
			</p>
		</AppFormGroup>

		<AppFormButton :disabled="!form.valid">
			{{ $gettext(`Block`) }}
		</AppFormButton>
	</AppForm>
</template>
