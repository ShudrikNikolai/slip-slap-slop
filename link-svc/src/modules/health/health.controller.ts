import { ApiOkResponse } from '@/common/decorators/api-response.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import {Public} from "@/modules/auth/decorators";

@ApiTags('HEALTH')
@Controller('health')
export class HealthController {
    constructor(
        private http: HttpHealthIndicator,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Public()
    @Get('ping')
    @HealthCheck()
    @ApiOkResponse('ok')
    async checkMe() {
        return 'ok';
    }

    @Public()
    @Get('network')
    @HealthCheck()
    @ApiOkResponse('ok', {
        google: { status: 'up' },
    })
    async checkNetwork() {
        return this.http.pingCheck('google', 'https://google.com', {
            timeout: 8000,
        });
    }

    @Public()
    @Get('database')
    @HealthCheck()
    @ApiOkResponse('ok')
    async checkDatabase() {
        return this.db.pingCheck('database', { timeout: 1500 });
    }
}
