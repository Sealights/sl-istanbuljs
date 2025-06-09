/* globals it */

const { assert } = require('chai');
const Instrumenter = require('../src/instrumenter');

const uuid = require('uuid');

function instrument(code, inputSourceMap) {
    const instrumenter = new Instrumenter({ compact: false });
    const result = instrumenter.instrumentSync(
        code,
        __filename,
        inputSourceMap
    );
    return {
        code: result,
        coverageData: instrumenter.lastFileCoverage(),
        sourceMap: instrumenter.lastSourceMap()
    };
}

it('should not alter already instrumented code', () => {
    // Mock uuid v4 to return a fixed value
    const mockUuid = () => '1234567890';
    uuid.v4 = mockUuid;

    const instrumented = instrument(`console.log('basic test');`);

    const result = instrument(instrumented.code, instrumented.sourceMap);
    [instrumented, result].forEach(({ sourceMap }) => {
        // XXX Ignore source-map difference caused by:
        // https://github.com/babel/babel/issues/10518
        delete sourceMap.mappings;
        delete sourceMap.names;
    });
    assert.deepEqual(instrumented, result);
});
