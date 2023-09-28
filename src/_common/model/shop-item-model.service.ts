export interface ShopItemModelCommonFields {
	name: string;
	description: string | undefined;
	is_premium: boolean;
	has_active_sale: boolean;
	was_approved: boolean;
	added_on: number | undefined;
}
