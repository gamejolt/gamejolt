import { Model } from '../model/model.service';

export class Subscription extends Model {
	declare id: number;
	declare user_id: number;
	declare resource_id: number;
	declare resource: string;
	declare type: string | null;
	declare created_on: number;

	// Specifically for comment subscriptions?
	declare comment_id?: number;

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

export async function $createSubscription(commentId: number) {
	const subscription = new Subscription();
	subscription.comment_id = commentId;

	await subscription.$save();
	return subscription;
}
