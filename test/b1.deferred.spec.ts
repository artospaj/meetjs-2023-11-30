import { defer } from "@johanblumenberg/ts-mockito";

class ResolvedCollector {
    resolved: Promise<unknown>[] = [];

    collect<T>(promise: Promise<T>): void {
        promise.then(
            () => this.resolved.push(promise)
        ).catch(() => {});
    }

    getResolved() {
        return this.resolved;
    }
}

describe('Deferred', () => {
    describe("", () => {
        it("it's easy to test that with Promise.resolve", async () => {
            const collector = new ResolvedCollector();
            
            // given
            const resolved = Promise.resolve();
            
            // when
            collector.collect(resolved);

            // and
            await resolved;

            // then
            expect(collector.getResolved()).toContain(resolved);            
        });

        it("little harder with Promise.rejected", async () => {
            const collector = new ResolvedCollector();
            
            // given
            const rejected = Promise.reject();
            
            // when
            collector.collect(rejected);

            // and
            await rejected.catch(() => {});

            // then
            expect(collector.getResolved()).not.toContain(rejected);            
        });

        it("and ultimately with defer()", async () => {
            const collector = new ResolvedCollector();
            
            // given
            const deferredPromise = defer<void>();
            
            // when
            collector.collect(deferredPromise);

            // then
            expect(collector.getResolved()).not.toContain(deferredPromise);            

            // when
            await deferredPromise.resolve();

            // then
            expect(collector.getResolved()).toContain(deferredPromise);            
        });

    })
});