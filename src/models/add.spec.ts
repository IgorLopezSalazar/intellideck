import {expect, test} from '@jest/globals';

import {Addition} from "./add";

test('adds 1 + 2 to equal 3', () => {
    let addObject = new Addition();
    expect(addObject.Add(1, 2)).toBe(3);
});