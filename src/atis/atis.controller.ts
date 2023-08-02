import { Controller, Get, Param } from '@nestjs/common';

@Controller('atis')
export class AtisController {

    @Get(':icaoId')
    getAtis(@Param() param: any): string {
        return param;
    }
}
