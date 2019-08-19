import { Model } from '../../../model/model.service';

export class FiresidePostSketchfab extends Model {
	fireside_post_id!: number;
	sketchfab_id!: string;
	thumbnail_url!: string;
}

Model.create(FiresidePostSketchfab);
