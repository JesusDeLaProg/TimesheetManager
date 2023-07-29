import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';
import { closeFirestore, initFirestore, TEST_USER } from '//test/test-base';
import { ActivityService } from '//services/activity/activity.service';
import { Activity, ActivityValidator } from '//dtos/activity';
import { ACTIVITIES } from '//config/constants';
import { QueryOptions } from '//dtos/query_options';

describe('ActivityController', () => {
  let db: Firestore;
  let root: DocumentReference;
  let providers: Provider[];
  let controller: ActivityController;
  let activities: CollectionReference<Activity>;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [ActivityService, ActivityValidator, ...providers],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    activities = module.get<CollectionReference<Activity>>(ACTIVITIES);
    await db.recursiveDelete(root);
    await activities.doc('1').set({ code: 'AB', name: 'Activity 1' });
    await activities.doc('2').set({ code: 'CD', name: 'Activity 2' });
    await activities.doc('3').set({ code: 'EF', name: 'Activity 3' });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should retrieve activities', async () => {
    expect(
      await controller.get(
        TEST_USER,
        Object.assign(new QueryOptions(), {
          sort: [{ field: 'name', direction: 'asc' }],
          limit: 2,
          skip: 1,
        }),
      ),
    ).toMatchObject([
      { code: 'CD', name: 'Activity 2' },
      { code: 'EF', name: 'Activity 3' },
    ]);
  });

  it('should retrieve activity by id', async () => {
    expect(await controller.getById(TEST_USER, '1')).toMatchObject({
      code: 'AB',
      name: 'Activity 1',
    });
  });

  it('should create an activity', async () => {
    expect(
      await controller.create(TEST_USER, { code: 'GH', name: 'Activity 4' }),
    ).toMatchObject({
      __success: true,
      value: { code: 'GH', name: 'Activity 4' },
    });
  });

  it('should update an activity', async () => {
    expect(
      await controller.update(TEST_USER, {
        _id: '1',
        code: 'ZZ',
        name: 'Activity 1',
      }),
    ).toMatchObject({
      __success: true,
      value: { _id: '1', code: 'ZZ', name: 'Activity 1' },
    });
  });

  it('should validate an activity', async () => {
    expect(
      await controller.validate({ _id: '1', code: 'ZZ', name: 'Activity 1' }),
    ).toMatchObject({
      __success: true,
      value: { _id: '1', code: 'ZZ', name: 'Activity 1' },
    });
  });
});
