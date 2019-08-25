import { isChildElement } from '../../../utils/dom';

/**
 * The purpose of this class is to watch the focus events regarding the content editor.
 * Editor controls only appear when the editor is focused.
 *
 * Since the buttons for editor/text controls should be considered as still being focused on the editor,
 * their blur/focus events need to also be tracked.
 * This class watches global focusin/out events to determine what the focus status of the entire editor component is.
 * Because the blur event fires after the focus events, we have to employ a loop that checks the status and stops the next blur event from firing.
 *
 * The chain of events goes like this:
 * (currently focused on editor textbox)
 * Focus on Button
 * Unfocus editor textbox
 *
 * Without intervening, the editor state would switch from focus to unfocus, even through the button, part of the editor, got focused.
 * The loop which runs at a 100ms delay will stop checking the next blur event when it is determined that we focused part of the editor.
 * If we indeed did NOT switch to part of the editor, the longest delay we experience is 100ms, which is fine.
 */
export class FocusWatcher {
	static readonly INTERVAL_LENGTH = 100; // ms

	private _editorElement: HTMLElement;
	private _blurCallback: () => void;
	private _focusCallback: () => void;

	private _handle: NodeJS.Timer | null = null;
	private _isSkipping = false;
	private _hasFocus = false;

	constructor(editorElement: HTMLElement, focusCallback: () => void, blurCallback: () => void) {
		this._editorElement = editorElement;
		this._blurCallback = blurCallback;
		this._focusCallback = focusCallback;

		this.loop = this.loop.bind(this);
		this.focusOutHandler = this.focusOutHandler.bind(this);
		this.focusInHandler = this.focusInHandler.bind(this);
	}

	public start() {
		this._handle = setInterval(this.loop, FocusWatcher.INTERVAL_LENGTH);
		document.addEventListener('focusout', this.focusOutHandler);
		document.addEventListener('focusin', this.focusInHandler);
	}

	public destroy() {
		if (this._handle) {
			clearInterval(this._handle);
			this._handle = null;
		}
		document.removeEventListener('focusout', this.focusOutHandler);
		document.removeEventListener('focusin', this.focusInHandler);
	}

	private loop() {
		if (this._isSkipping) {
			this._isSkipping = false;
		} else {
			if (this._hasFocus) {
				this._focusCallback();
			} else {
				this._blurCallback();
			}
		}
	}

	private focusOutHandler() {
		this._isSkipping = true;
		this._hasFocus = false;
	}

	private focusInHandler(e: Event) {
		if (
			e.target instanceof HTMLElement &&
			!(e.target instanceof HTMLInputElement) && // child input elements don't count as editor focus
			isChildElement(this._editorElement, e.target)
		) {
			this._hasFocus = true;
		} else {
			this._isSkipping = true;
			this._hasFocus = false;
		}
	}
}
