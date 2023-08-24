<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../../_common/filters/number';
import { BaseForm, FormOnSubmit } from '../../../../../../_common/form-vue/form.service';
import { KeyGroupModel, KeyGroupType } from '../../../../../../_common/key-group/key-group.model';

class Wrapper extends BaseForm<any> {}

@Options({
	components: {
		AppExpand,
	},
})
export default class FormGameKeyGroupAddKeys extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Object) keyGroup!: KeyGroupModel;

	readonly formatNumber = formatNumber;
	readonly KeyGroupTypeAnonymous = KeyGroupType.Anonymous;
	readonly KeyGroupTypeAnonymousClaim = KeyGroupType.AnonymousClaim;
	readonly KeyGroupTypeEmail = KeyGroupType.Email;
	readonly KeyGroupTypeUser = KeyGroupType.User;

	created() {
		this.form.warnOnDiscard = false;
	}

	onSubmit() {
		return Api.sendRequest(
			`/web/dash/developer/games/key-groups/add-keys/` +
				`${this.keyGroup.game_id}/${this.keyGroup.id}`,
			this.formModel
		);
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			v-if="
				keyGroup.type === KeyGroupTypeAnonymous ||
				keyGroup.type === KeyGroupTypeAnonymousClaim
			"
			name="amount"
			:label="$gettext(`# of Keys to Generate`)"
		>
			<AppFormControl
				type="number"
				step="1"
				min="1"
				:max="20000 - keyGroup.key_count"
				:validators="[validateMinValue(1), validateMaxValue(20000 - keyGroup.key_count)]"
			/>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			v-if="keyGroup.type === KeyGroupTypeEmail"
			name="emails"
			:label="$gettext(`Email Addresses`)"
		>
			<p class="help-block">
				{{ $gettext(`Paste one email address per line, or separate them by commas.`) }}
			</p>
			<AppFormControlTextarea rows="10" :validators="[validateMaxLength(25000)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			v-if="keyGroup.type === KeyGroupTypeUser"
			name="users"
			:label="$gettext(`Usernames`)"
		>
			<p class="help-block">
				{{ $gettext(`Paste one username per line, or separate them by commas.`) }}
			</p>
			<AppFormControlTextarea rows="10" :validators="[validateMaxLength(25000)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppExpand :when="serverErrors['num-keys']">
			<div class="alert alert-notice">
				{{
					$gettextInterpolate(
						`You can only have a max of %{ max } keys in a single key group.`,
						{ max: formatNumber(20000) }
					)
				}}
			</div>
		</AppExpand>

		<AppFormButton>
			{{ $gettext(`Add`) }}
		</AppFormButton>
	</AppForm>
</template>
