import { SinonFakeTimers, useFakeTimers } from "sinon";
import sleep from "sleep-promise";

describe('#0: Given we have timer-based operation that produces side effect (swaps flag)', () => {
    let flag = false;

    function switchingFlagThatTakes10sec(): void {
        setTimeout(() => { flag = true }, 10_000);
    }

    let latestData: string;
    function pollData(): void {
        setTimeout(async () => {
            // let's say it's polling the data
            let data = await Promise.resolve(true); 

            flag = data;
        }, 10_000);
    }

    it("#0.0: and we have time to waste on waiting, we can just wait :)", async () => {
        // given: operation started
        switchingFlagThatTakes10sec();

        // when: 10 sec elapsed
        await sleep(10_100);

        // then
        expect(flag).toBeTruthy();
    });

    describe('#0.1: and we dont really want to wait that long..', () => {

        afterEach(() => jest.useRealTimers());

        it('#0.1.1: if switching flag in synchronous, then it is fairly easy to mock timers with Jest.', () => {
            // prepare: mock timers
            jest.useFakeTimers();

             // given: operation started
            switchingFlagThatTakes10sec();

            // when: we pretend 10 sec elapsed
            jest.advanceTimersByTime(10_100);

            // then: it's gonna be okay :)
            expect(flag).toBeTruthy();
        });

        it('#0.1.2: but what if switching flag is asynchronous?..', () => {
            // prepare: mock timers
            jest.useFakeTimers();

            // given: operation started
            pollData();

            // when: 10 sec elapsed
            jest.advanceTimersByTime(10_100);

            // then: this is going to fail!
            expect(flag).toBeTruthy(); 
        });

        it('#0.1.3: we can solve it ugly way', async () => {
            // prepare: mock timers
            jest.useFakeTimers();

            // given: operation started
            pollData();

            // when: 10 sec elapsed
            jest.advanceTimersByTime(10_100);

            await Promise.resolve();

            // then: this is going to work again!
            expect(flag).toBeTruthy(); 
        });

        describe('#0.1.4: but what if our operation is promise chain?', () => {
            function pollData(): void {
                setTimeout(async () => {
                    sleep(5_000)
                        .then(() => Promise.resolve(true))
                        .then((data) => {
                            flag = data;
                        });
                }, 5_000);
            }      

            it('will "ugly way" work?', async () => {
                // prepare: mock timers
                jest.useFakeTimers();

                // given: operation started
                pollData();

                // when: 10 sec elapsed
                jest.advanceTimersByTime(10_100);

                await Promise.resolve();

                // then: this is going to fail!
                expect(flag).toBeTruthy(); 
            });

            it('but what if we play with timers and empty promises?', async () => {
                // prepare: mock timers
                jest.useFakeTimers();

                // given: operation started
                pollData();

                // when: 10 sec elapsed
                jest.advanceTimersByTime(5_000);
                await Promise.resolve();
                await Promise.resolve();
                jest.advanceTimersByTime(5_000);
                await Promise.resolve();
                await Promise.resolve();

                // then: this is going to fail!
                expect(flag).toBeTruthy(); 
            });

            describe('with SinonJS', () => {
                let clock: SinonFakeTimers;
        
                beforeEach(() => {
                    clock = useFakeTimers();
                });
        
                it('then fake timers work well and fast', async () => {
                    // given: some process started, and we know it takes 10 sec to accomplish
                    pollData()
        
                    // when: I mock the flow of time
                    await clock.tickAsync(10100);
        
                    // then: it works :)
                    expect(flag).toBeTruthy();
                });
        
                afterEach(() => {
                    clock.restore();
                })
            });
        })
    });
})