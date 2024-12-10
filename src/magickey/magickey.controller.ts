import { Controller, Post, Param } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import axios from 'axios';

@Controller('magickey')
export class MagickeyController {
  private readonly verifyUrl = `https://eth-mainnet.nodereal.io/v1/${process.env.RPC_KEY}`;

  @Post(':wallet/verify')
  @Public()
  async verifyMagickey(@Param('wallet') wallet: string) {
    try {
      const data = {
        jsonrpc: '2.0',
        method: 'nr_getTokenBalance721',
        params: [
          '0x8881c19665bbf8fa0677900d0e6c689e71bd8db7',
          wallet,
          '0x1333EF1',
        ],
        id: 3,
      };
      const res = await axios.post(this.verifyUrl, data);
      const balanceOfERC721 = parseInt(res.data.result, 16);
      if (balanceOfERC721 > 0) {
        return 'VERIFIED';
      } else {
        return 'NOT_VERIFIED';
      }
    } catch (error) {
      return 'NOT_VERIFIED';
    }
  }
}
