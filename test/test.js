const { expect } = require("chai");

const yakusoku = require('../index');

describe('Functions', () => {
    describe('allSettled', () => {
        it('should throw an error when argument is null', () => {
            const arg = null;

            expect(() => yakusoku.allSettled(null)).to.throw();
        });

        it('should throw an error when argument is undefined', () => {
            const arg = undefined;

            expect(() => yakusoku.allSettled(arg)).to.throw();
        });

        it('should throw an error when argument is not an array', () => {
            const arg = 'some string';

            expect(() => yakusoku.allSettled(arg)).to.throw();
        });

        it('should throw an error when argument is an array but not of promises', () => {
            const arg = ['some', 'string'];

            expect(() => yakusoku.allSettled(arg)).to.throw();
        });

        it('should return a new promise when argument is an array of promises', () => {
            const arg = [Promise.resolve(1), Promise.resolve(2)];

            expect(yakusoku.allSettled(arg)).to.be.instanceOf(Promise);
        });

        it('should resolve promise and return results when all argument promises resolve', () => {
            const arg = [Promise.resolve(1), Promise.resolve(2)];

            return yakusoku
                .allSettled(arg)
                .then(value => {
                    expect(value)
                        .to
                        .be
                        .instanceOf(Array)
                        .and
                        .to
                        .have
                        .length(arg.length);
                });
        });

        it('should resolve promise and return results when all argument promises either resolve or reject', () => {
            const arg = [Promise.resolve(1), Promise.reject(new Error())];

            return yakusoku
                .allSettled(arg)
                .then(value => {
                    expect(value)
                        .to
                        .be
                        .instanceOf(Array)
                        .and
                        .to
                        .have
                        .length(arg.length);
                });
        });
    });

    describe('batchMapAsync', () => {
        it('should throw error when source is not an array', () => {
            const source = 'some string';
            const sourceItemToPromise = (item) => Promise.resolve(item);
            const batchSize = 10;

            expect(() => yakusoku.batchMapAsync(source, sourceItemToPromise, batchSize)).to.throw();
        });

        it('should throw error when mapping function is not a function', () => {
            const source = [1, 2];
            const sourceItemToPromise = 'mapping function';
            const batchSize = 10;

            expect(() => yakusoku.batchMapAsync(source, sourceItemToPromise, batchSize)).to.throw();
        });

        it('should throw error when batch size is not a number', () => {
            const source = [1, 2];
            const sourceItemToPromise = (item) => Promise.resolve(item);
            const batchSize = '10';

            expect(() => yakusoku.batchMapAsync(source, sourceItemToPromise, batchSize)).to.throw();
        });

        it('should return promise when calling batchMapAsync()', () => {
            const source = [1, 2];
            const sourceItemToPromise = (item) => Promise.resolve(item);
            const batchSize = 2;

            expect(yakusoku.batchMapAsync(source, sourceItemToPromise, batchSize))
                .to
                .be
                .instanceOf(Promise);
        });

        it('should eventually resolve to array of processed batches', () => {
            const source = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const sourceItemToPromise = (item) => Promise.resolve(item * 2);
            const batchSize = 5;

            yakusoku
                .batchMapAsync(source, sourceItemToPromise, batchSize)
                .then(batches => {
                    expect(batches)
                        .to
                        .be
                        .instanceOf(Array)
                        .and
                        .to
                        .have
                        .length(2);
                });
        });

        it('should eventually resolve to array of processed batches with mapped items', () => {
            const source = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const expected = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
            const sourceItemToPromise = (item) => Promise.resolve(item * 2);
            const batchSize = 5;

            yakusoku
                .batchMapAsync(source, sourceItemToPromise, batchSize)
                .then(batches => {
                    expect(batches.flatMap(batch => batch))
                        .to
                        .be
                        .instanceOf(Array)
                        .and
                        .to
                        .have
                        .length(source.length)
                        .and
                        .to
                        .be
                        .eql(expected);
                });
        });
    });
});