import { randomUUID } from 'crypto';

import {
  ConnectorError,
  ConnectorErrorCodes,
  GetAuthorizationUri,
  GetUserInfo,
  ConnectorMetadata,
  Connector,
  SocialConnectorInstance,
  GetConnectorConfig,
} from '@logto/connector-types';

import { defaultMetadata } from './constant';
import { mockSocialConfigGuard, MockSocialConfig, mockSocialDataGuard } from './types';

export default class MockSocialConnector implements SocialConnectorInstance<MockSocialConfig> {
  public metadata: ConnectorMetadata = defaultMetadata;
  private _connector?: Connector;

  public get connector() {
    if (!this._connector) {
      throw new ConnectorError(ConnectorErrorCodes.General);
    }

    return this._connector;
  }

  public set connector(input: Connector) {
    this._connector = input;
  }

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig(config: unknown): asserts config is MockSocialConfig {
    const result = mockSocialConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    return `http://mock.social.com/login?state=${state}&redirect_uri=${redirectUri}`;
  };

  public getAccessToken = async () => randomUUID();

  public getUserInfo: GetUserInfo = async (data) => {
    const { sub } = await this.authorizationCallbackHandler(data);

    return {
      id: sub,
    };
  };

  private readonly authorizationCallbackHandler = async (parameterObject: unknown) => {
    const result = mockSocialDataGuard.safeParse(parameterObject);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    return result.data;
  };
}
