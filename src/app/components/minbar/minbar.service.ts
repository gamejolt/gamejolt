export interface MinbarItem
{
	isActive?: boolean;
	notificationCount?: number;
	title: string;
	thumb: string;
	onClick?: Function;
}

export class Minbar
{
	static items: MinbarItem[] = [];

	static add( item: MinbarItem )
	{
		this.items.push( item );
		return item;
	}

	static remove( item: MinbarItem )
	{
		const index = this.items.findIndex( ( i ) => i === item );
		if ( index !== -1 ) {
			this.items.splice( index, 1 );
		}
	}
}
