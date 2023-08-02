import { PartialType } from '@nestjs/mapped-types';
import { CreateRunwayParamDto } from './create-runway-param.dto';

export class UpdateRunwayParamDto extends PartialType(CreateRunwayParamDto) {}
