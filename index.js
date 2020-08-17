const inspector = require('my_inspector');

const allSettled = (promises) => {
    if(
        !inspector.isObjectOfType(promises, Array) || 
        !promises.every(promise => inspector.isObjectOfType(promise, Promise))
    ) {
        throw new TypeError('Argument must be an array of promises');
    }

    return new Promise((resolve) => {
        let aggregatedResults = [];
        let finishedPromises = 0;
        
        const settleCallback = (value, index) => {
            aggregatedResults[index] = value

            if(++finishedPromises === promises.length) {
                resolve(aggregatedResults);
            }
        };

        promises.forEach((promise, index) => {
            promise
                .then((value) => settleCallback(value, index))
                .catch((err) => settleCallback(err, index));
        });
    });
};

const batchMapAsync = (source, sourceItemToPromise, batchSize) => {
    const indexRange = (increment) => {
        let start = 0;
        let end = increment - 1;
    
        return nextRange = () => {
            if(start >= source.length) {
                return null;
            }

            const tuple = [start, end];

            start = end + 1;
            end += increment;
    
            return tuple;
        }
    };

    const nextBatch = (indexRange, indexRangeGenerator, resolveCallback, aggregatedResults) => {
        allSettled(source.slice(indexRange[0], indexRange[1] + 1).map(sourceItemToPromise))
            .then((batchResults) => {
                handleBatch(batchResults, aggregatedResults, indexRangeGenerator, resolveCallback);
            });
    };

    const handleBatch = (batchResults, aggregatedResults, indexRangeGenerator, resolveCallback) => {
        aggregatedResults.push(batchResults);

        let next = indexRangeGenerator();

        if(next === null) {
            resolveCallback(aggregatedResults);
            return;
        }

        nextBatch(next, indexRangeGenerator, resolveCallback, aggregatedResults);
    };

    if(
        !inspector.isObjectOfType(source, Array) ||
        !inspector.isOfType(sourceItemToPromise, 'function') || 
        !inspector.isOfType(batchSize, 'number')
    ) {
        throw new TypeError('Arguments must be an array, a function and a number, respectively');
    }

    return new Promise((resolve) => {
        const aggregatedResults = [];
        const nextRange = indexRange(batchSize);

        nextBatch(nextRange(), nextRange, resolve, aggregatedResults);
    });
};

module.exports.allSettled = allSettled;
module.exports.batchMapAsync = batchMapAsync;