<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../../_common/filters/number';
import { BaseForm, FormOnSubmit } from '../../../../../../_common/form-vue/form.service';
import { KeyGroup } from '../../../../../../_common/key-group/key-group.model';

class Wrapper extends BaseForm<any> {}

@Options({
	components: {
		AppExpand,
	},
})
export default class FormGameKeyGroupAddKeys extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Object) keyGroup!: KeyGroup;

	readonly formatNumber = formatNumber;
	readonly KeyGroup = KeyGroup;

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
			name="amount"
			:label="$gettext(`# of Keys to Generate`)"
			v-if="
				keyGroup.type === KeyGroup.TYPE_ANONYMOUS ||
				keyGroup.type === KeyGroup.TYPE_ANONYMOUS_CLAIM
			"
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
			name="emails"
			:label="$gettext(`Email Addresses`)"
			v-if="keyGroup.type === KeyGroup.TYPE_EMAIL"
		>
			<p class="help-block">
				<AppTranslate>Paste one email address per line, or separate them by commas.</AppTranslate>
			</p>
			<AppFormControlTextarea rows="10" :validators="[validateMaxLength(25000)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			name="users"
			:label="$gettext(`Usernames`)"
			v-if="keyGroup.type === KeyGroup.TYPE_USER"
		>
			<p class="help-block">
				<AppTranslate>Paste one username per line, or separate them by commas.</AppTranslate>
			</p>
			<AppFormControlTextarea rows="10" :validators="[validateMaxLength(25000)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppExpand :when="serverErrors['num-keys']">
			<div class="alert alert-notice">
				<AppTranslate
					:translate-params="{
						max: formatNumber(20000),
					}"
				>
					You can only have a max of %{ max } keys in a single key group.
				</AppTranslate>
			</div>
		</AppExpand>

		<AppFormButton>
			<AppTranslate>Add</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
