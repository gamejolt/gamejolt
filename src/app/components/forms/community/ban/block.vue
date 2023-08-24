<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppFormControlPrefix from '../../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { getDatalistOptions } from '../../../../../_common/settings/datalist-options.service';
import {
	getCommunityBlockReasons,
	REASON_OTHER,
	REASON_SPAM,
} from '../../../../../_common/user/action-reasons';
import { UserModel } from '../../../../../_common/user/user.model';

interface FormModel {
	username: string;
	reasonType: string;
	reason: string;
	expiry: string;
	ejectPosts: boolean;
}

class Wrapper extends BaseForm<FormModel> {}
@Options({
	components: {
		AppFormControlToggle,
		AppFormControlPrefix,
	},
})
export default class FormCommunityBlock extends mixins(Wrapper) implements FormOnSubmit {
	@Prop({ type: Object, required: true }) community!: CommunityModel;
	@Prop({ type: Object, default: null }) user!: UserModel | null;

	usernameLocked = false;
	otherOptions: string[] = [];

	get defaultReasons() {
		return getCommunityBlockReasons();
	}

	get expiryOptions() {
		return {
			hour: this.$gettext('1 Hour'),
			day: this.$gettext('1 Day'),
			week: this.$gettext('1 Week'),
			month: this.$gettext('1 Month'),
			year: this.$gettext('1 Year'),
			never: this.$gettext('Never'),
		};
	}

	get showReasonOther() {
		return this.formModel.reasonType === REASON_OTHER;
	}

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('reasonType', REASON_SPAM);
		this.setField('expiry', 'week');
		this.setField('ejectPosts', true);

		if (this.user) {
			this.setField('username', this.user.username);
			this.usernameLocked = true;
		}

		const options = getDatalistOptions('community-user-block', this.community.id.toString());
		this.otherOptions = options.getList();
	}

	async onSubmit() {
		const response = await Api.sendRequest(
			`/web/dash/communities/blocks/add/${this.community.id}`,
			this.formModel
		);

		if (!response.success) {
			if (response.errors.collaborator) {
				showErrorGrowl({
					title: this.$gettext('Collaborators cannot be blocked'),
					message: this.$gettextInterpolate(
						'%{ user } is a Collaborator on this Community. Remove them from the collaborators list first to block them.',
						{ user: this.formModel.username }
					),
				});
			}
		} else {
			// Add custom options entry to list of options.
			if (this.formModel.reasonType === REASON_OTHER && this.formModel.reason) {
				const options = getDatalistOptions(
					'community-user-block',
					this.community.id.toString()
				);
				options.unshiftItem(this.formModel.reason);
			}

			if (this.formModel.ejectPosts) {
				const whatsRemoved = this.$gettext('posts');

				const message = this.$gettextInterpolate(
					'%{ user } was blocked from this Community. It might take a few moments for their %{ stuff } to disappear.',
					{
						user: this.formModel.username,
						stuff: whatsRemoved,
					}
				);

				showSuccessGrowl({
					message: this.$gettextInterpolate(message, {
						user: this.formModel.username,
					}),
				});
			} else {
				showSuccessGrowl({
					message: this.$gettextInterpolate(
						'%{ user } was blocked from this Community.',
						{
							user: this.formModel.username,
						}
					),
				});
			}
		}

		return response;
	}
}
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
				<AppTranslate>
					Once the user is blocked, all their posts will be ejected from the community.
					This also affects their featured posts.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton :disabled="!valid">
			<AppTranslate>Block</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
