import { Module } from '@nestjs/common';
import { BoilerPartsService } from './boiler-parts.service';
import { BoilerPartsController } from './boiler-parts.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [BoilerPartsService],
  controllers: [BoilerPartsController],
  exports: [BoilerPartsService],
})
export class BoilerPartsModule {}
