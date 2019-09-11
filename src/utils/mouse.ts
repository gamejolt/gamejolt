export type MouseButton = 'left' | 'middle' | 'right' | 'browser-back' | 'browser-forward';

export class MouseState {
	private _state = [false, false, false, false, false];
	private _element?: HTMLElement;

	constructor(watchElement?: HTMLElement) {
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);

		if (watchElement instanceof HTMLElement) {
			this._element = watchElement;
			watchElement.addEventListener('mousedown', this.onMouseDown);
			watchElement.addEventListener('mouseup', this.onMouseUp);
		} else {
			document.addEventListener('mousedown', this.onMouseDown);
			document.addEventListener('mouseup', this.onMouseUp);
		}
	}

	public isButtonDown(button: MouseButton) {
		switch (button) {
			case 'left':
				return this._state[0];
			case 'middle':
				return this._state[1];
			case 'right':
				return this._state[2];
			case 'browser-back':
				return this._state[3];
			case 'browser-forward':
				return this._state[4];
		}
	}

	public destroy() {
		if (this._element instanceof HTMLElement) {
			this._element.removeEventListener('mousedown', this.onMouseDown);
			this._element.removeEventListener('mouseup', this.onMouseUp);
		} else {
			document.removeEventListener('mousedown', this.onMouseDown);
			document.removeEventListener('mouseup', this.onMouseUp);
		}
	}

	private onMouseDown(e: MouseEvent) {
		this.setButtonState(e, true);
	}

	private onMouseUp(e: MouseEvent) {
		this.setButtonState(e, false);
	}

	private setButtonState(e: MouseEvent, nextState: boolean) {
		const buttonIndex = e.button;
		if (buttonIndex >= 0 && buttonIndex <= 4) {
			this._state[buttonIndex] = nextState;
		}
	}
}
