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
export default class AppFinancialsManagedAccountDob extends Vue {
	@Prop(String) namePrefix!: string;

	days: string[] = [];
	years: string[] = [];

	parent: FormFinancialsManagedAccountTS = null as any;

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;

		this.days = [];
		for (let i = 1; i <= 31; ++i) {
			this.days.push('' + i);
		}

		this.years = [];
		const maxYear = new Date().getFullYear() - 13;
		for (let i = maxYear; i > maxYear - 100; --i) {
			this.years.push('' + i);
		}
	}
}
</script>

<template>
	<div>
		<div
			v-if="
				!parent.getStripeField(namePrefix + '.year') &&
				(parent.requiresField(namePrefix + '.year') ||
					parent.requiresField(namePrefix + '.month') ||
					parent.requiresField(namePrefix + '.day'))
			"
		>
			<div>
				<label class="control-label"><translate>Date of Birth</translate></label>
			</div>

			<div class="row">
				<div v-if="parent.requiresField(namePrefix + '.month')" class="col-sm-4">
					<app-form-group
						:name="`${namePrefix}.month`"
						:label="$gettext('Month')"
						:hide-label="true"
					>
						<app-form-control-select>
							<option value=""><translate>Month</translate></option>
							<option value="1"><translate>January</translate></option>
							<option value="2"><translate>February</translate></option>
							<option value="3"><translate>March</translate></option>
							<option value="4"><translate>April</translate></option>
							<option value="5"><translate>May</translate></option>
							<option value="6"><translate>June</translate></option>
							<option value="7"><translate>July</translate></option>
							<option value="8"><translate>August</translate></option>
							<option value="9"><translate>September</translate></option>
							<option value="10"><translate>October</translate></option>
							<option value="11"><translate>November</translate></option>
							<option value="12"><translate>December</translate></option>
						</app-form-control-select>

						<app-form-control-errors />
					</app-form-group>
				</div>
				<div v-if="parent.requiresField(namePrefix + '.day')" class="col-sm-4">
					<app-form-group :name="`${namePrefix}.day`" :label="$gettext('Day')" hide-label>
						<app-form-control-select>
							<option value=""><translate>Day</translate></option>
							<option v-for="i of days" :key="i" :value="i">
								{{ i }}
							</option>
						</app-form-control-select>

						<app-form-control-errors />
					</app-form-group>
				</div>
				<div v-if="parent.requiresField(namePrefix + '.year')" class="col-sm-4">
					<app-form-group
						:name="`${namePrefix}.year`"
						:label="$gettext('Year')"
						:hide-label="true"
					>
						<app-form-control-select>
							<option value=""><translate>Year</translate></option>
							<option v-for="i of years" :key="i" :value="i">
								{{ i }}
							</option>
						</app-form-control-select>

						<app-form-control-errors />
					</app-form-group>
				</div>
			</div>
		</div>

		<div v-if="parent.getStripeField(namePrefix + '.year')" class="form-horizontal">
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>Date of Birth</translate>
				</label>
				<div class="form-static col-sm-8">
					<translate>Provided</translate>
				</div>
			</div>
		</div>
	</div>
</template>
