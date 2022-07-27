import { HTTPError } from 'got';

import {
  mockSocialConnectorConfig,
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '@/__mocks__/connectors-mock';
import {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  updateUserPassword,
  updateConnectorConfig,
  enableConnector,
  disableConnector,
  deleteUserIdentity,
} from '@/api';
import { createUser, signInWithSocialAndBindToNewAccount } from '@/helpers';

describe('admin console user management', () => {
  it('should create user successfully', async () => {
    const user = await createUser();

    const userDetails = await getUser(user.id);
    expect(userDetails.id).toBe(user.id);
  });

  it('should get user list successfully', async () => {
    await createUser();
    const users = await getUsers();

    expect(users.length).not.toBeLessThan(1);
  });

  it('should update userinfo successfully', async () => {
    const user = await createUser();

    const newUserData = {
      name: 'new name',
      avatar: 'https://new.avatar.com/avatar.png',
      customData: {
        level: 1,
      },
      roleNames: ['admin'],
    };

    const updatedUser = await updateUser(user.id, newUserData);

    expect(updatedUser).toMatchObject(newUserData);
  });

  it('should delete user successfully', async () => {
    const user = await createUser();

    const userEntity = await getUser(user.id);
    expect(userEntity).toMatchObject(user);

    await deleteUser(user.id);

    const response = await getUser(user.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });

  it('should update user password successfully', async () => {
    const user = await createUser();
    const userEntity = await updateUserPassword(user.id, 'new_password');
    expect(userEntity).toMatchObject(user);
  });

  it('should delete user identity successfully', async () => {
    // Setup mock social connector
    await updateConnectorConfig(mockSocialConnectorId, mockSocialConnectorConfig);
    await enableConnector(mockSocialConnectorId);

    const userId = await signInWithSocialAndBindToNewAccount();

    const user = await getUser(userId);

    expect(user.identities).toHaveProperty(mockSocialConnectorTarget);

    await deleteUserIdentity(userId, mockSocialConnectorTarget);

    const updatedUser = await getUser(userId);

    expect(updatedUser.identities).not.toHaveProperty(mockSocialConnectorTarget);

    // Reset mock social connector
    await disableConnector(mockSocialConnectorId);
  });
});
