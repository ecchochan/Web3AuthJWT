import { ethers } from 'ethers';
import { ClientRequestPayload, IdTokenData, SIGNIN_MESSAGE } from './constants';
import { server } from './server';

const base64decode = (str: string) =>
  Buffer.from(str, 'base64').toString('binary');
const base64encode = (str: string) =>
  Buffer.from(str, 'binary').toString('base64');

export const serverDecodeClientPayload = (
  requestPayload: ClientRequestPayload
) => {
  const { payload, sig } = requestPayload;
  const { idToken, data } = JSON.parse(payload);
  const idTokenData = decodeIdToken(idToken);

  // corrupted, bye!
  if (!idTokenData) return null;

  // expired, bye!
  if (+new Date() > idTokenData.exp) return null;

  // not the owner, bye
  if (ethers.utils.verifyMessage(payload, sig) !== idTokenData.uid) return null;

  return { idToken, idTokenData, data };
};

const decodeIdToken = (idToken: string): IdTokenData | null => {
  const [idTokenPayload, sig] = idToken.split('|');
  const signerAddrVerify = ethers.utils.verifyMessage(idTokenPayload, sig);
  if (signerAddrVerify !== server.address) return null;
  return JSON.parse(base64decode(idTokenPayload));
};

export const serverEncodeIdToken = async (
  address: string,
  signature: string
) => {
  const signerAddrVerify = ethers.utils.verifyMessage(
    SIGNIN_MESSAGE,
    signature
  );
  // not a message from the owner, bye
  if (signerAddrVerify !== address) return null;

  // TODO: is this address verified in backend? e.g. email/phone verification
  // const user = await getUserFromDb(address);
  const user = {
    id: address,
    name: '(๑´ڡ`๑)',
    phoneVerified: true,
  };
  if (!user.phoneVerified) return null; // Bye

  const idTokenData: IdTokenData = {
    uid: address,
    exp: +new Date() + 3600,
  };
  const idTokenPayload = base64encode(JSON.stringify(idTokenData));
  const sig = await server.signMessage(idTokenPayload);
  const idToken = idTokenPayload + '|' + sig;
  return idToken;
};
