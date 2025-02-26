import { Injectable } from '@nestjs/common';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class AgoraService {
  generateToken(channelName: string, uid: string): string {
    const appId = process.env.AGORA_APP_ID as string;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE as string;
    const role = RtcRole.PUBLISHER; // Role PUBLISHER (speaker/video) or SUBSCRIBER (listener/watch)
    const expirationTimeInSeconds = 3600;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimeInSeconds + expirationTimeInSeconds;

    return RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      Number(uid),
      role,
      privilegeExpiredTs,
    );
  }
}
