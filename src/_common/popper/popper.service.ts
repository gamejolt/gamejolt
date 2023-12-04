export interface PopperComponentInterface {
	onHideAll: () => void;
}

class PopperService {
	popperInterfaces = new Map<number, PopperComponentInterface>();

	registerPopper(id: number, popper: PopperComponentInterface) {
		this.popperInterfaces.set(id, popper);
	}

	deregisterPopper(id: number) {
		this.popperInterfaces.delete(id);
	}

	hideAll() {
		for (const [_id, popper] of this.popperInterfaces) {
			popper.onHideAll();
		}
	}
}

export const Popper = /** @__PURE__ */ new PopperService();
