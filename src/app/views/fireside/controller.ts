import { Fireside } from '../../../_common/fireside/fireside.model';

export const FiresideControllerKey = Symbol('fireside-controller');

export class FiresideController {
	fireside: Fireside | null = null;
}
