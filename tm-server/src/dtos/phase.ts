import { IPhase } from "@tm/types/models/datamodels";
import { IsOptional, IsString } from "class-validator";

export class Phase implements IPhase {
    @IsString()
    @IsOptional()
    _id?: string;

    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsString({each: true})
    activities: string[];
}
