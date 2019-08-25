import { Model } from '../../model/model.service';

export class YoutubeChannel extends Model {
	user_id!: number;
	channel_id!: string;
	title!: string;

	$remove() {
		return this.$_remove('/web/dash/linked-accounts/unlink-youtube-channel/' + this.channel_id);
	}

	get link() {
		return `https://www.youtube.com/channel/${this.channel_id}`;
	}
}

Model.create(YoutubeChannel);
