const assert = require('assert');
const bytes = require('../node_modules/bytes/index.js');

describe('bytes(value)', function () {
    it('should parse a string string', function () {
        assert.strictEqual(bytes('1kb'), 1024);
        assert.strictEqual(bytes('1KB'), 1024);
    });

    it('should format a number', function () {
        assert.strictEqual(bytes(1024), '1KB');
        assert.strictEqual(bytes(1000), '1000B');
    });

    it('should return null for unsupported types', function () {
        assert.strictEqual(bytes(undefined), null);
        assert.strictEqual(bytes(null), null);
        assert.strictEqual(bytes({}), null);
    });
});

describe('bytes.format(number, options)', function () {
    it('should format bytes', function () {
        assert.strictEqual(bytes.format(1024), '1KB');
        assert.strictEqual(bytes.format(1024 * 1024), '1MB');
        assert.strictEqual(bytes.format(1024 * 1024 * 1024), '1GB');
        assert.strictEqual(bytes.format(Math.pow(1024, 4)), '1TB');
    });

    it('should support custom decimal places', function () {
        assert.strictEqual(bytes.format(1024 * 1.5, { decimalPlaces: 0 }), '2KB');
        assert.strictEqual(bytes.format(1024 * 1.5, { decimalPlaces: 1 }), '1.5KB');
        assert.strictEqual(bytes.format(1024 * 1.5, { decimalPlaces: 2 }), '1.5KB');
    });

    it('should support fixed decimals', function () {
        assert.strictEqual(bytes.format(1024, { fixedDecimals: true, decimalPlaces: 2 }), '1.00KB');
        assert.strictEqual(bytes.format(1024 * 1.5, { fixedDecimals: true, decimalPlaces: 2 }), '1.50KB');
    });

    it('should support thousands separator', function () {
        assert.strictEqual(bytes.format(1000 * 1024, { unit: 'KB', thousandsSeparator: ',' }), '1,000KB');
        assert.strictEqual(bytes.format(1024 * 1024 * 1024, { thousandsSeparator: '.' }), '1.00GB');
    });

    it('should support unit separator', function () {
        assert.strictEqual(bytes.format(1024, { unitSeparator: ' ' }), '1 KB');
        assert.strictEqual(bytes.format(1024, { unitSeparator: '\t' }), '1\tKB');
    });

    it('should support specific unit', function () {
        assert.strictEqual(bytes.format(1024, { unit: 'b' }), '1024B');
        assert.strictEqual(bytes.format(1024, { unit: 'KB' }), '1KB');
        assert.strictEqual(bytes.format(1024, { unit: 'MB' }), '0.00MB');
    });

    it('should return null for non-finite numbers', function () {
        assert.strictEqual(bytes.format(NaN), null);
        assert.strictEqual(bytes.format(Infinity), null);
        assert.strictEqual(bytes.format(-Infinity), null);
    });

    it('should handle negative numbers', function () {
        assert.strictEqual(bytes.format(-1024), '-1KB');
    });
});

describe('bytes.parse(string)', function () {
    it('should parse byte units case-insensitively', function () {
        assert.strictEqual(bytes.parse('1kb'), 1024);
        assert.strictEqual(bytes.parse('1KB'), 1024);
        assert.strictEqual(bytes.parse('1Kb'), 1024);
    });

    it('should parse various units', function () {
        assert.strictEqual(bytes.parse('1b'), 1);
        assert.strictEqual(bytes.parse('1kb'), 1024);
        assert.strictEqual(bytes.parse('1mb'), 1048576);
        assert.strictEqual(bytes.parse('1gb'), 1073741824);
        assert.strictEqual(bytes.parse('1tb'), Math.pow(1024, 4));
        assert.strictEqual(bytes.parse('1pb'), Math.pow(1024, 5));
    });

    it('should handle floats', function () {
        assert.strictEqual(bytes.parse('1.5kb'), 1024 * 1.5);
        assert.strictEqual(bytes.parse('1.5KB'), 1024 * 1.5);
    });

    it('should assume bytes if no unit provided', function () {
        assert.strictEqual(bytes.parse('1024'), 1024);
        assert.strictEqual(bytes.parse('500'), 500);
    });

    it('should return number if input is number', function () {
        assert.strictEqual(bytes.parse(100), 100);
    });

    it('should return null for invalid inputs', function () {
        assert.strictEqual(bytes.parse(null), null);
        assert.strictEqual(bytes.parse(undefined), null);
        assert.strictEqual(bytes.parse(true), null);
        // Invalid string formats
        assert.strictEqual(bytes.parse('invalid'), NaN);
    });
});