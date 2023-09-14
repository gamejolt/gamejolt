import { Model } from '../model/model.service';

export class SubscriptionModel extends Model {
	declare id: number;
	declare user_id: number;
	declare resource_id: number;
	declare resource: string;
	declare type: string | null;
	declare created_on: number;

	// Specifically for comment subscriptions?
	declare comment_id?: number;
}

function _saveSubscription(model: SubscriptionModel) {
	if (!model.id) {
		return model.$_save('/comments/subscriptions/add/' + model.comment_id, 'subscription', {
			ignorePayloadUser: true,
		});
	}

	throw new Error('No edit method for subscriptions.');
}

export async function $createSubscription(commentId: number) {
	const subscription = new SubscriptionModel();
	subscription.comment_id = commentId;

	await _saveSubscription(subscription);
	return subscription;
}

export function $removeSubscription(model: SubscriptionModel) {
	return model.$_remove('/comments/subscriptions/remove/' + model.id, {
		ignorePayloadUser: true,
	});
}
