import { computed, markRaw, ref } from 'vue';
import { getDeviceOS } from '../../device/device.service';
const { EventEmitter } = require('events') as typeof import('events');

const process = require('process') as typeof import('process');

// Only attempt to require asg-prebuilt on Windows.
const asgNative = getDeviceOS() === 'windows' ? require('asg-prebuilt') : null;

const SampleRate = 44100;
const NumChannels = 1;
const Format: AudioSampleFormat = 'f32';

export type ASGControllerStatus = 'starting' | 'started' | 'stopping' | 'stopped';

export type ASGController = Awaited<ReturnType<typeof startDesktopAudioCapture>>;

export async function startDesktopAudioCapture(
	writableStream: WritableStream<AudioData>,
	{ onStartCaptureFailed }: { onStartCaptureFailed: () => void }
) {
	// We get the parent process's pid since it would also contain all the child
	// pids under it then.
	const appPid = process.ppid;

	const writer = markRaw(writableStream.getWriter());
	const emitter = markRaw(new EventEmitter());
	const uid = ref('');
	const status = ref<ASGControllerStatus>('starting');

	// Promise that is resolved after the capture has stopped, and the asg
	// instance has cleaned up. At that point it should be safe to start another
	// capture.
	let _cleanupResolver: () => void;
	let _cleanupCalled = false;
	const _cleanupPromise = new Promise<void>(resolve => {
		_cleanupResolver = resolve;
	});

	emitter
		.on('status_update', (text: string) => {
			console.log('Status update: ' + text);

			// This will happen when stop() is called and we tell the recording
			// to end. When ASG finalizes it'll send this status update and we
			// can finally resolve the stop().
			if (text === 'end_recording') {
				// ASG takes a literal second to stop, so we have to mimic it
				// here. Ugh.
				setTimeout(() => _cleanup(), 1_000);
			}
		})
		.on('error', (err: string) => {
			console.log('Caught error: ' + err);

			// if start_capturer_failed was emitted, asg will stop itself, and
			// eventually call end_recording. we should transition into stopping
			// status to reflect that.
			if (err === 'start_capturer_failed') {
				status.value = 'stopping';
				// This allows the caller to call .stop() to figure out when asg
				// has fully stopped and is ready to be activated again.
				onStartCaptureFailed();
			}
		})
		.on('data', (data: Float32Array, timestamp: number) => {
			try {
				if (status.value !== 'started') {
					return;
				}

				const audioData = new AudioData({
					format: Format,
					numberOfChannels: NumChannels,
					numberOfFrames: data.length,
					timestamp,
					sampleRate: SampleRate,
					data,
				});

				writer.write(audioData);
			} catch (err) {
				console.error(err);
			}
		});

	try {
		uid.value = asgNative.startCapture(appPid, emitter.emit.bind(emitter));
		status.value = 'started';
	} catch (error) {
		console.error('Got error while starting ASG capture', error);
		status.value = 'stopping';
		await _cleanup();
	}

	async function stop() {
		if (status.value === 'stopped' || status.value === 'stopping') {
			return _cleanupPromise;
		}

		status.value = 'stopping';
		asgNative.endCapture(uid.value);

		await _cleanupPromise;
	}

	/**
	 * Finalizes the asg instance.
	 *
	 * This MUST be called only when asg native is ready to start capturing again.
	 *
	 * - Removes all event listeners.
	 * - Closes the generator's writable stream.
	 * - Sets the status of the instance to full stopped.
	 */
	async function _cleanup() {
		if (_cleanupCalled) {
			return;
		}
		_cleanupCalled = true;

		emitter.removeAllListeners();
		await writer.close();
		status.value = 'stopped';
		_cleanupResolver();
	}

	return {
		// readonly
		pid: computed(() => appPid),
		writer,
		emitter,
		uid,
		status,

		stop,
	};
}
