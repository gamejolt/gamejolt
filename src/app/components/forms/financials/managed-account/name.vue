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
export default class AppFinancialsManagedAccountName extends Vue {
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
		<div v-if="!parent.getStripeField(namePrefix + '.first_name')" class="row">
			<div v-if="parent.requiresField(namePrefix + '.first_name')" class="col-sm-6">
				<app-form-group :name="`${namePrefix}.first_name`" :label="$gettext('First Name')">
					<app-form-control />
					<app-form-control-errors />
				</app-form-group>
			</div>
			<div v-if="parent.requiresField(namePrefix + '.last_name')" class="col-sm-6">
				<app-form-group :name="`${namePrefix}.last_name`" :label="$gettext('Last Name')">
					<app-form-control />
					<app-form-control-errors />
				</app-form-group>
			</div>
		</div>

		<div
			v-if="
				!parent.getStripeField(namePrefix + '.relationship.title') &&
				parent.requiresField(namePrefix + '.relationship.title')
			"
		>
			<app-form-group
				:name="`${namePrefix}.relationship.title`"
				:label="$gettext('Job Title')"
			>
				<app-form-control />
				<app-form-control-errors />
			</app-form-group>
		</div>

		<div
			v-if="
				parent.getStripeField(namePrefix + '.first_name') ||
				parent.getStripeField(namePrefix + '.title')
			"
			class="form-horizontal"
		>
			<div v-if="parent.getStripeField(namePrefix + '.first_name')" class="form-group">
				<label class="control-label col-sm-4">
					<translate>Name</translate>
				</label>
				<div class="form-static col-sm-8">
					{{ parent.getStripeField(namePrefix + '.first_name') }}
					{{ parent.getStripeField(namePrefix + '.last_name') }}
				</div>
			</div>

			<div
				v-if="parent.getStripeField(namePrefix + '.relationship.title')"
				class="form-group"
			>
				<label class="control-label col-sm-4">
					<translate>Job Title</translate>
				</label>
				<div class="form-static col-sm-8">
					{{ parent.getStripeField(namePrefix + '.relationship.title') }}
				</div>
			</div>
		</div>
	</div>
</template>
