import { Environment } from '../environment/environment.service';
import { Model } from '../model/model.service';
import { SettingStickerSounds } from '../settings/settings.service';

export function playStickerSound(stickerId: number) {
	if (!SettingStickerSounds.get()) {
		return;
	}

	const stickerSoundPath = Environment.staticCdnUrl + `/audio/stickers/${stickerId}.ogg`;
	const audio = new Audio(stickerSoundPath);
	audio.play();
}

export class Sticker extends Model {
	public static readonly RARITY_COMMON = 0;
	public static readonly RARITY_UNCOMMON = 1;
	public static readonly RARITY_RARE = 2;
	public static readonly RARITY_EPIC = 3;

	rarity!: number;
	img_url!: string;

	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(Sticker);
