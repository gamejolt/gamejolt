<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { Country, Geo, Region } from '../../../_common/geo/geo.service';
import { AddressData, useWidgetPackageStore } from '../../store/index';

@Options({})
export default class AppAddress extends Vue {
	store = setup(() => useWidgetPackageStore());

	address = {
		country: 'us',
		region: '',
		street1: '',
		postcode: '',
	};

	countries: Country[] = [];
	regions: Region[] | null = [];

	// From the form library.
	errors: any;

	created() {
		this.countries = Geo.getCountries();
		this.countryChanged();
	}

	countryChanged() {
		this.regions = Geo.getRegions(this.address.country) || null;

		if (this.regions) {
			this.address.region = this.regions[0].code;
		} else {
			this.address.region = '';
		}
	}

	submit() {
		const addressData = Object.assign(new AddressData(), this.address);
		this.store.address = addressData;
		this.store.checkout();
	}
}
</script>

<template>
	<div>
		<p>
			<app-jolticon icon="info-circle" />
			Because of international tax laws, we are required to collect this information.
		</p>

		<form novalidate>
			<div class="form-group">
				<select
					id="country"
					v-model="address.country"
					class="form-control"
					name="country"
					@change="countryChanged"
				>
					<option v-for="country of countries" :key="country.code" :value="country.code">
						{{ country.name }}
					</option>
				</select>
			</div>

			<div class="form-group">
				<input
					id="street1"
					v-model="address.street1"
					v-validate="'required'"
					type="text"
					class="form-control"
					name="street1"
					placeholder="Street Address"
				/>
			</div>

			<div class="row">
				<div class="col-xs-4">
					<div class="form-group">
						<div v-if="!regions">
							<input
								id="region"
								v-model="address.region"
								v-validate="'required'"
								type="text"
								class="form-control"
								name="region"
								placeholder="State/Province"
							/>
						</div>
						<div v-else>
							<select
								id="region"
								v-model="address.region"
								class="form-control"
								name="region"
							>
								<option
									v-for="region in regions"
									:key="region.code"
									:value="region.code"
								>
									{{ region.name }}
								</option>
							</select>
						</div>
					</div>
				</div>
				<div class="col-xs-4">
					<div class="form-group">
						<input
							id="postcode"
							v-model="address.postcode"
							v-validate="'required'"
							type="text"
							class="form-control"
							name="postcode"
							placeholder="Zip/Postal Code"
						/>
					</div>
				</div>
			</div>

			<div v-if="errors.any()" class="form-errors">
				<div class="alert alert-notice">
					<app-jolticon icon="notice" />
					{{ errors.all()[0] }}
				</div>
			</div>
			<div v-else>
				<app-button
					primary
					solid
					:disabled="errors.any() ? 'disabled' : undefined"
					@click.prevent="submit"
				>
					Proceed to PayPal
				</app-button>
			</div>
		</form>
	</div>
</template>

<style lang="stylus" scoped>
.address-form
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 30px // Make room for footer.
	padding: $shell-padding
	z-index: 1
</style>
