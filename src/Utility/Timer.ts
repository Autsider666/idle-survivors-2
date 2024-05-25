import {Timer as GameTimer} from 'excalibur';

type SpecificTime = {
    hours?: number,
    minutes?: number,
    seconds?: number,
}

type Callback = () => void;

export class Timer extends GameTimer {
    private listenerRepeats: Map<Callback, number> = new Map<Callback, number>();

    constructor() {
        super({
            fcn: () => {
                // console.log(this.getTimeRunning());
            },
            repeats: true,
            interval: 100,
        });
        // setInterval(() => {
        //     const now = new Date();
        //     const passedTime = this.startDateTime - now;
        //
        //     console.log(passedTime);
        //
        // }, 1000);
    }

    onTime(time: SpecificTime, callback: Callback): void {
        const specificTime = this.convertTime(time);
        const wrappedCallback = () => {
            if (this.getTimeRunning() < specificTime) {
                return;
            }

            callback();

            const remainingRepeats = (this.listenerRepeats.get(wrappedCallback) ?? 0) - 1;
            if (remainingRepeats <= 0) {
                this.listenerRepeats.delete(wrappedCallback);
                this.off(wrappedCallback);
                return;
            }

            this.listenerRepeats.set(wrappedCallback, remainingRepeats);
        };

        this.listenerRepeats.set(wrappedCallback, 1);
        this.on(wrappedCallback);
    }

    everyTime(time: SpecificTime, callback: Callback, maxRepeats?: number): void {
        const specificTime = this.convertTime(time);
        let lastTimeCalled = this.getTimeRunning();
        const wrappedCallback = () => {
            const currentTime = this.getTimeRunning();
            if (currentTime - lastTimeCalled < specificTime) {
                return;
            }

            callback();

            const remainingRepeats = (this.listenerRepeats.get(wrappedCallback) ?? 1) - 1;
            if (remainingRepeats === 0) {
                this.listenerRepeats.delete(wrappedCallback);
                this.off(wrappedCallback);
                return;
            }

            lastTimeCalled = currentTime;

            this.listenerRepeats.set(wrappedCallback, remainingRepeats);
        };

        if (maxRepeats) {
            this.listenerRepeats.set(wrappedCallback, maxRepeats ?? -1);
        }

        this.on(wrappedCallback);
    }

    private convertTime({seconds, minutes, hours}: SpecificTime): number {
        let time = 0;
        if (seconds) {
            time += seconds;
        }
        if (minutes) {
            time += minutes * 60;
        }
        if (hours) {
            time += hours * 3600;
        }

        return time * 1000;
    }
}