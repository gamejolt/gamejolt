import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./address.html';
import { Helpers } from './managed-account';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import {
	Geo,
	Country,
} from '../../../../../lib/gj-lib-client/components/geo/geo.service';

@View
@Component({})
export class FormFinancialsManagedAccountAddress extends BaseForm<any>
	implements FormOnInit {
	@Prop(Boolean) forceRequired: boolean;

	@Prop(String) namePrefix: string;

	@Prop(Object) helpers: Helpers;

	countries: Country[] = [];

	Geo = Geo;

	onInit() {
		this.countries = Geo.getCountries();
	}
}
