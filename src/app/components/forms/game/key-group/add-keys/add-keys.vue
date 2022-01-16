<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../_common/expand/expand.vue';
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
	<app-form :controller="form">
		<app-form-group
			name="amount"
			:label="$gettext(`# of Keys to Generate`)"
			v-if="
				keyGroup.type === KeyGroup.TYPE_ANONYMOUS ||
				keyGroup.type === KeyGroup.TYPE_ANONYMOUS_CLAIM
			"
		>
			<app-form-control
				type="number"
				step="1"
				min="1"
				:max="20000 - keyGroup.key_count"
				:validators="[validateMinValue(1), validateMaxValue(20000 - keyGroup.key_count)]"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="emails"
			:label="$gettext(`Email Addresses`)"
			v-if="keyGroup.type === KeyGroup.TYPE_EMAIL"
		>
			<p class="help-block">
				<translate>Paste one email address per line, or separate them by commas.</translate>
			</p>
			<app-form-control-textarea rows="10" :validators="[validateMaxLength(25000)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="users"
			:label="$gettext(`Usernames`)"
			v-if="keyGroup.type === KeyGroup.TYPE_USER"
		>
			<p class="help-block">
				<translate>Paste one username per line, or separate them by commas.</translate>
			</p>
			<app-form-control-textarea rows="10" :validators="[validateMaxLength(25000)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-expand :when="serverErrors['num-keys']">
			<div class="alert alert-notice">
				<translate
					:translate-params="{
						max: formatNumber(20000),
					}"
				>
					You can only have a max of %{ max } keys in a single key group.
				</translate>
			</div>
		</app-expand>

		<app-form-button>
			<translate>Add</translate>
		</app-form-button>
	</app-form>
</template>
