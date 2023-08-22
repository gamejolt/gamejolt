import { Model, defineLegacyModel } from '../../model/model.service';
import { Sellable } from '../../sellable/sellable.model';

export class OrderItem extends defineLegacyModel(
	class OrderItemDefinition extends Model {
		declare amount: number;
		declare tax_amount: number;
		declare is_refunded: boolean;
		declare sellable: Sellable;

		constructor(data: any = {}) {
			super(data);

			if (data.sellable) {
				this.sellable = new Sellable(data.sellable);
			}
		}
	}
) {}
