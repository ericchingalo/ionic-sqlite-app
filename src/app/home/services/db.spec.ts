import { Db } from './db';

describe('Db', () => {
  it('should create an instance', () => {
    expect(new Db()).toBeTruthy();
  });
});
