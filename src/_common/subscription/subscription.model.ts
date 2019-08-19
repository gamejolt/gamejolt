import { Model } from '../model/model.service';

export class Subscription extends Model {
	id!: number;
	user_id!: number;
	resource_id!: number;
	resource!: string;
	type!: string | null;
	created_on!: number;

	// Specifically for comment subscriptions?
	comment_id?: number;

	static async $subscribe(commentId: number) {
		const subscription = new Subscription();
		subscription.comment_id = commentId;

		await subscription.$save();
		return subscription;
	}

	$save() {
		if (!this.id) {
			return this.$_save('/comments/subscriptions/add/' + this.comment_id, 'subscription', {
				ignorePayloadUser: true,
			});
		}

		throw new Error('No edit method for subscriptions.');
	}

	$remove() {
		return this.$_remove('/comments/subscriptions/remove/' + this.id, {
			ignorePayloadUser: true,
		});
	}
}

Model.create(Subscription);
