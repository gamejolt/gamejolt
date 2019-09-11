import { Model } from '../../model/model.service';
import { Sellable } from '../../sellable/sellable.model';

export class OrderItem extends Model {
	amount!: number;
	tax_amount!: number;
	is_refunded!: boolean;
	sellable!: Sellable;

	constructor(data: any = {}) {
		super(data);

		if (data.sellable) {
			this.sellable = new Sellable(data.sellable);
		}
	}
}

Model.create(OrderItem);
