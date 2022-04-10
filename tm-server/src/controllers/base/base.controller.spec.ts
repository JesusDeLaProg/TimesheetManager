import { BaseController } from './base.controller';

describe('BaseController', () => {
  let controller: BaseController<number>;

  beforeEach(async () => {
    controller = new BaseController<number>();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('get() returns empty array', () => {
    expect(controller.get()).toEqual([]);
  });
});
