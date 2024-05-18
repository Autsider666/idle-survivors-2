import { BaseActor } from "./BaseActor";

type Props = {
    radius: number,
    speed: number,
}

export class Orbiter extends BaseActor {
    constructor(private readonly props: Props) {
        super();
    }
}