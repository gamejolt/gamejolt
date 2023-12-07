import { Model } from '../../model/model.service';
import { SellableModel } from '../../sellable/sellable.model';

export class OrderItemModel extends Model {
	declare amount: number;
	declare tax_amount: number;
	declare is_refunded: boolean;
	declare sellable: SellableModel;

	constructor(data: any = {}) {
		super(data);

		if (data.sellable) {
			this.sellable = new SellableModel(data.sellable);
		}
	}
}
