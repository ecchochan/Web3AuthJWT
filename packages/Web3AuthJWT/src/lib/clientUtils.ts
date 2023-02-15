import { ethers } from 'ethers';
import { ClientRequestPayload } from './constants';

export const clientCreateRequestPayload = async (
  client: ethers.Wallet,
  data: unknown,
  idToken: string
): Promise<ClientRequestPayload> => {
  const payload = JSON.stringify({
    data,
    idToken,
  });
  const sig = await client.signMessage(payload);

  return { payload, sig };
};
