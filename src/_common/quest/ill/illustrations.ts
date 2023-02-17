import illBackpackClosedPath from './backpack-closed.svg';
import illBackpackOpenPath from './backpack-open.svg';

interface IllustrationAsset {
	path: string;
	width: number;
	height: number;
}

export const illBackpackClosed: IllustrationAsset = {
	path: illBackpackClosedPath,
	width: 512,
	height: 512,
};

export const illBackpackOpen: IllustrationAsset = {
	path: illBackpackOpenPath,
	width: 512,
	height: 512,
};
