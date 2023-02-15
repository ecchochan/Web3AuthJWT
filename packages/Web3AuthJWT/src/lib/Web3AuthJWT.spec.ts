import { ethers } from 'ethers';
import { SIGNIN_MESSAGE } from './constants';
import { clientCreateRequestPayload } from './clientUtils';
import { serverDecodeClientPayload, serverEncodeIdToken } from './Web3AuthJWT';

const client = ethers.Wallet.createRandom();

describe('ethers basics', () => {
  it('should grant a user an idToken for access to backend', async () => {
    /**
     * client: I want to interact with server
     *         let me authenticate first so that not everyone can interact with server and overload it
     */
    const signature = await client.signMessage(SIGNIN_MESSAGE);
    const address = client.address;

    /**
     * server: check if this guy has his phone verified
     *         if yes, grant him/her a token to access backend! (･∀･)b
     */
    const idToken = await serverEncodeIdToken(address, signature);
    if (!idToken) {
      // no access!
      expect(idToken).toBeTruthy();
      return;
    }
    // idToken
    // > 'eyJ1aW...|0xc20f622...39761c'

    /**
     * client: now I have the idToken, I want to change my name!
     */
    const requestPayload = await clientCreateRequestPayload(
      client,
      {
        name: '¯_(ツ)_/¯',
      },
      idToken
    );
    // requestPayload
    // > {
    //     payload: '{"data":{"name":"¯_(ツ)_/¯"},"idToken":"eyJ1aW...|0xc20f622...39761c"}',
    //     sig: '0x8fdca5...0db21b'
    //   }

    /**
     * server: no problem! I will check your idToken and payload!
     */
    const args = serverDecodeClientPayload(requestPayload);
    if (!args) {
      // no access!
      expect(args).toBeTruthy();
      return;
    }
    // args
    // >  {
    //      idToken: "eyJ1aW...|0xc20f622...39761c",
    //      idTokenData: {
    //        uid: '0x2139c974078d7f871413bF26aeB3449a4f3A3dC5',
    //        exp: 1676476964743
    //      },
    //      data: { name: '¯_(ツ)_/¯' }
    //    }

    const { idTokenData, data } = args;
    expect(idTokenData.uid).toBe(client.address);
    //TODO: do something about `data`
  });
});
