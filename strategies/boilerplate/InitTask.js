const starter = Mep.getDriver('StarterDriver');

const TAG = 'InitTask';

class InitTask extends Task {
    async onRun() {
        await starter.waitStartSignal();

        await openClaps(100);

        this.finish();
    }
}

module.exports = InitTask;
