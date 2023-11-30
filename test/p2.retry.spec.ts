import sleep from "sleep-promise";
import retry from "async-retry";

class Consumer {
    constructor(
        private readonly businessLogic: (msg: string) => void
    ) {}


    consume(msg: string) {
        this.businessLogic(msg);
    }
}

function Producer(consumer: Consumer): (msg: string) => void {
    return (msg: string): void => {
        // sleep for 1 - 11 sec
        sleep((Math.random() * 10_000) + 1_000)
            .then(() => consumer.consume(msg));
    }
}

describe('S2: Handling asynchronous integration tests', () => {

    it('"naive" integration test', async () => {
        // given: consumer is started
        const businessLogic = jest.fn();
        const consumer = new Consumer(businessLogic);

        // when: the message is produced
        Producer(consumer)('foo');

        // when: some time 
        await sleep(10_000);

        // then
        expect(businessLogic).toHaveBeenCalledWith('foo');
    });

    it('retry-async integration test', async () => {

        // given: consumer is started
        const businessLogic = jest.fn();
        const consumer = new Consumer(businessLogic);

        // when: the message is produced
        Producer(consumer)('foo');

        await retry(async () => {
            // then
            expect(businessLogic).toHaveBeenCalledWith('foo');
        }, { maxRetryTime: 20_000, minTimeout: 500, factor: 1, forever: true })
    });
});
