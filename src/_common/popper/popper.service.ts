export interface PopperComponentInterface {
	onHideAll: () => void;
}

export class Popper {
	static popperInterfaces = new Map<number, PopperComponentInterface>();

	static registerPopper(id: number, popper: PopperComponentInterface) {
		this.popperInterfaces.set(id, popper);
	}

	static deregisterPopper(id: number) {
		this.popperInterfaces.delete(id);
	}

	static hideAll() {
		for (const [_id, popper] of this.popperInterfaces) {
			popper.onHideAll();
		}
	}
}
