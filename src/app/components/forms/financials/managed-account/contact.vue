<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form-common';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Options({
	components: {
		...CommonFormComponents,
	},
})
export default class AppFinancialsManagedAccountContact extends Vue {
	@Prop(String) namePrefix!: string;

	parent: FormFinancialsManagedAccountTS = null as any;

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}
}
</script>

<template>
	<div>
		<div class="row">
			<div
				class="col-sm-6"
				v-if="
					!parent.getStripeField(namePrefix + '.email') &&
						parent.requiresField(namePrefix + '.email')
				"
			>
				<app-form-group :name="`${namePrefix}.email`" :label="$gettext('Email')">
					<app-form-control type="email" />
					<app-form-control-errors />
				</app-form-group>
			</div>
			<div
				class="col-sm-6"
				v-if="
					!parent.getStripeField(namePrefix + '.phone') &&
						parent.requiresField(namePrefix + '.phone')
				"
			>
				<app-form-group
					:name="`${namePrefix}.phone`"
					:label="$gettext('Phone (with country code)')"
				>
					<app-form-control />
					<app-form-control-errors />
				</app-form-group>
			</div>
		</div>

		<div
			class="form-horizontal"
			v-if="
				parent.getStripeField(namePrefix + '.email') || parent.getStripeField(namePrefix + '.phone')
			"
		>
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>Contact</translate>
				</label>
				<div class="form-static col-sm-8">
					<div v-if="parent.getStripeField(namePrefix + '.email')">
						{{ parent.getStripeField(namePrefix + '.email') }}
					</div>
					<div v-if="parent.getStripeField(namePrefix + '.phone')">
						{{ parent.getStripeField(namePrefix + '.phone') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
