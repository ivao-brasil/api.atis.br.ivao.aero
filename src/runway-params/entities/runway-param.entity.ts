import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('runway')
export class RunwayParam {

  @PrimaryColumn()
  runway: string;

  @Column()
  heading: number;

  @Column()
  icaoCode: string;

  @Column()
  takeoffEnabled: boolean;

  @Column({
    type: "json"
  })
  takeoffRulesSet: any;

  @Column()
  landingEnabled: boolean;

  @Column({
    type: "json"
  })
  landingRulesSet: any;
}
