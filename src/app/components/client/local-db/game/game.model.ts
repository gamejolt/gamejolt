export class LocalDbGame {
	id = 0;

	title = '';
	slug = '';
	img_thumbnail = '';
	// header_media_item?: MediaItem;
	compatibility: any = null;
	modified_on = 0;

	developer = {
		id: 0,
		username: '',
		name: '',
		display_name: '',
		slug: '',
		img_avatar: '',
	};

	get routeLocation() {
		return {
			name: 'discover.games.view.overview',
			params: this.routeParams,
		};
	}

	get routeParams() {
		return {
			id: this.id + '',
			username: this.developer.username,
			slug: this.slug,
		};
	}
}
