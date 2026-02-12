import { ApiOkResponse } from '@/common/decorators/api-response.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@ApiTags('HEALTH')
@Controller('health')
export class HealthController {
    constructor(
        private http: HttpHealthIndicator,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Get('ping')
    @HealthCheck()
    @ApiOkResponse('ok')
    async checkMe() {
        return 'ok';
    }

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

    @Get('database')
    @HealthCheck()
    @ApiOkResponse('ok')
    async checkDatabase() {
        return this.db.pingCheck('database', { timeout: 1500 });
    }
}
